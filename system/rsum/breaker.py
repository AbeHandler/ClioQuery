'''
This is a simple script which breaks up data from google into a jsonl format
'''

import os
import sys
import json

fn = sys.argv[1]

e = 0
with open(fn.replace(".json", ".jsonl"), "w") as of:
    with open(fn, "r") as inf:
        dt = inf.read().split("\n\n")
        for d in dt:
            try:
                ds = json.loads(d)
                of.write(json.dumps(ds)+"\n")
            except:
                print(e)
                e +=1

os.remove(fn) 
