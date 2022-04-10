"""
This file cleans up a table created automatically with
knitr in histogram_maker.R 

The point of this file is just to make the table look
nicer in latex
"""

if __name__ == "__main__":
    TABLENAME = "crowd_table.tex"

    with open(TABLENAME, "r") as inf:
        txt = inf.read()
        
    lns = txt.split("\n")[1:-1]
    lns[0] = lns[0].replace("llrll", "llccc")
    lns[2] = lns[2].replace("All & condition", " & ")
    lns[4] = lns[4].replace("All", "\multirow{2}{*}{All*}")
    lns[5] = lns[5].replace("All", " ") + "\midrule"
    lns[6] = lns[6].replace("Engaged", "\multirow{2}{*}{Engaged*}")
    lns[7] = lns[7].replace("Engaged", " ")
    lns[3] = lns[3] 

    with open(TABLENAME, "w") as of:
        ou = "\n".join(lns)
        of.write(ou)