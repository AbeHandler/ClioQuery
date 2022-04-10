# ClioQuery

Directories in the repo are listed below.

### tex

- The `tex` directory holds latex files for the paper "ClioQuery: Interactive Query-Oriented Text Analytics for Comprehensive Investigation of Historical News Archives" from Abram Handler, Narges Mahyar and Brendan O'Connor.

### system

- The `system` directory holds the code for the ClioQuery system, along with a small sample corpus of 25 New York Times editorials mentioning "Salvador". 

- To run the system you need to first create a conda environment with the required dependencies. To do this, run `cd system/webapp && conda env create -f environment.yml && conda activate cqdemo`. This will load an environment called `cqdemo`.

- After you create the environment, run `py app.py` (you should be in `system/webapp` already) and then navigate to `http://localhost:5010/`. You should see the ClioQuery interface running on a small corpus of 25 New York Times editorials mentioning "Salvador."

- To load a new corpus, create a `.jsonl` file in the same format as `editorial_Salvador.jsonl` and run `py make_backend_indexes.py` to fill the `cache/` directory.

- The demo in `webapp` uses a precompiled `app.js` file which implements the ClioQuery front-end. To rebuild or modify the front-end for the webapp you will need to run a javascript build system which will compile the `.jsx` files to a `app.js` file. That `app.js` file is then loaded into `webapp.py` and presented in the user interface. Javascript build systems change quickly and tend to require a lot of configuration, so this repo does not include instructions for configuring or setting up a build system. The `.jsx` files are located in `system/webapp/frontend`. 

### sec_8

- `make_results.py` makes many quantitative results for Section 8. Many of these results are written to files & latex macros reported in the paper, so if you look at included files in the tex of section 8 (or macros defined in `packages_and_commands.tex`) you can see how numbers in the paper are generated.
- `section_8_qual.jsonl` contains qualitative feedback reported in Section 8 of the paper. Worker IDs have been removed for anonymity. 
