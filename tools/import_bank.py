#!/usr/bin/env python3
"""Read the supplied XLSX directly; preserve every question and reference answer."""
import argparse
import collections
import hashlib
import json
from pathlib import Path
import xml.etree.ElementTree as ET
import zipfile

parser = argparse.ArgumentParser()
parser.add_argument('workbook', type=Path)
parser.add_argument('--output', type=Path, default=Path('dist/data.js'))
args = parser.parse_args()
ns = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
types = {'单选': 'single', '多选': 'multiple', '判断': 'boolean'}
questions = []
with zipfile.ZipFile(args.workbook) as archive:
    shared = []
    if 'xl/sharedStrings.xml' in archive.namelist():
        for item in ET.fromstring(archive.read('xl/sharedStrings.xml')):
            shared.append(''.join(node.text or '' for node in item.findall('.//m:t', ns)))
    root = ET.fromstring(archive.read('xl/worksheets/sheet1.xml'))
    for row in root.findall('.//m:row', ns):
        values = {}
        for cell in row.findall('m:c', ns):
            column = ''.join(c for c in cell.attrib['r'] if c.isalpha())
            value = cell.find('m:v', ns)
            value = value.text if value is not None else ''
            if cell.attrib.get('t') == 's':
                value = shared[int(value)] if value else ''
            elif cell.attrib.get('t') == 'inlineStr':
                value = ''.join(node.text or '' for node in cell.findall('.//m:t', ns))
            values[column] = value or ''
        question_type = types.get(values.get('A', '').strip().replace('题', ''))
        if not question_type:
            continue
        options = [{'key': chr(65 + i), 'text': values.get(chr(68 + i), '').strip()}
                   for i in range(7) if values.get(chr(68 + i), '').strip()]
        raw_answer = values['K'].strip()
        if question_type == 'boolean':
            options = [{'key': 'T', 'text': '正确'}, {'key': 'F', 'text': '错误'}]
            assert raw_answer in ['√', '×'], (row.attrib['r'], raw_answer)
            answer = ['T' if raw_answer == '√' else 'F']
        else:
            answer = sorted(set(raw_answer.upper().replace(' ', '')))
        assert values['C'].strip() and answer
        assert set(answer) <= {option['key'] for option in options}, row.attrib['r']
        assert question_type != 'single' or len(answer) == 1
        questions.append({'id': f'q{len(questions) + 1:03d}', 'number': len(questions) + 1,
                          'type': question_type, 'difficulty': int(values['B']),
                          'text': values['C'].strip(), 'options': options,
                          'answer': answer, 'sourceAnswer': raw_answer,
                          'sourceRow': int(row.attrib['r'])})
assert len(questions) == 505, len(questions)
assert len({q['text'] for q in questions}) == len(questions)
bank = {'version': '20260918', 'title': '化学检验员理论复习题库',
        'source': args.workbook.name, 'sha256': hashlib.sha256(args.workbook.read_bytes()).hexdigest(),
        'questions': questions}
args.output.parent.mkdir(parents=True, exist_ok=True)
args.output.write_text('/* Imported from the supplied workbook; answers are unchanged. */\nwindow.CHEM_BANK = '
                       + json.dumps(bank, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
print(json.dumps({'total': len(questions), 'types': dict(collections.Counter(q['type'] for q in questions)),
                  'output': str(args.output)}, ensure_ascii=False))
