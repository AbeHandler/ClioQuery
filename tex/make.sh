#!/usr/bin/env bash
pdflatex main
bibtex main
pdflatex main
pdflatex main
rm comment.cut

pdflatex appendix_main
bibtex appendix_main
pdflatex appendix_main
pdflatex appendix_main
