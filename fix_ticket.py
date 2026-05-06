import sys

path = 'src/components/TicketCard.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the double closing angle bracket on the button tag at line 204
fixed = content.replace('border-brand-blue/10">>', 'border-brand-blue/10">')

count = content.count('border-brand-blue/10">>')
print(f'Found {count} occurrence(s) to fix')

with open(path, 'w', encoding='utf-8') as f:
    f.write(fixed)

print('Done')
