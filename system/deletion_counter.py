# coding: utf-8
import pickle
with open("out.p", "rb") as inf:
    dt = pickle.load(inf)
 
methods = []
for d in dt["out"]:
    methods.append(d["mention"]["method"])
    

print(dt["q"])
print(dt["f"])
    
from collections import Counter

print(Counter(methods))
