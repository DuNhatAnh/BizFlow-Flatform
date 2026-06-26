import os
import glob
import re

dir_path = "/Users/dunhatanh/BizFlow-Flatform/mobile/lib/views"
for root, _, files in os.walk(dir_path):
    for file in files:
        if file.endswith('.dart'):
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()
            
            # Replace: order.id.substring(0, 8).toUpperCase()
            new_content = re.sub(
                r'\b([a-zA-Z0-9_]+)\.id\.substring\(0,\s*(\d+)\)\.toUpperCase\(\)',
                r'(\1.code.isNotEmpty ? \1.code : \1.id.substring(0, \2).toUpperCase())',
                content
            )
            
            # Replace: order.id.substring(0, 8)
            new_content = re.sub(
                r'\b([a-zA-Z0-9_]+)\.id\.substring\(0,\s*(\d+)\)(?!\.toUpperCase)',
                r'(\1.code.isNotEmpty ? \1.code : \1.id.substring(0, \2))',
                new_content
            )
            
            if new_content != content:
                with open(path, 'w') as f:
                    f.write(new_content)
                print(f"Updated {path}")
