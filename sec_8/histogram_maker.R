library(knitr)
library(effsize)

df = read_csv('turk.csv')
df["All"] = "All" 

dummy = read_csv('turk.csv')
perfects = dummy %>% dplyr::filter(engaged=="Engaged")
perfects["All"] = "Engaged"

dfmerged = bind_rows(df, perfects)

dfmerged = dfmerged %>% mutate(condition = replace(condition, condition=="CQ", "ClioQuery"))

ggplot(dfmerged, aes(x=as.numeric(dfmerged$total_correct))) + geom_histogram(bins=6) + 
       facet_grid(condition ~ .) + theme_bw() + ylab("Count") + 
       theme(plot.title = element_text(hjust = 0.5), text = element_text(size=20)) + 
       xlab("Total correct") + facet_grid(All ~ condition) + scale_x_continuous(breaks = seq(3,8,1))

ggsave("faceted_histogram.pdf")

t = dfmerged %>% group_by(All, condition) %>% summarise(N=n(), "Mean correct"=sprintf("%.3f", mean(`total_correct`)), "Std. Dev."=sprintf("(%.3f)", sd(`total_correct`)))

tab = t %>% kable(format="latex", booktabs = TRUE)

writeLines(tab, "crowd_table.tex")
system('python table_cleanup.py')

### make our pretty histogram 

dat = read_csv("sample_means.csv")
dat$value = as.numeric(dat$value)

cbbPalette <- c("#d95f02", "#1b9e77")

dat = dat %>% mutate(condition = replace(variable, variable=="CQ", "ClioQuery"))
dat["Sample mean"] = dat$value

ggplot(dat, aes(x=`Sample mean`, fill=condition)) + geom_histogram(bins=31, alpha=0.6, position="identity") + theme_bw() +
  scale_fill_manual(values=cbbPalette) + ylab("Count") + 
  theme(plot.title = element_text(hjust = 0.5), text = element_text(size=20))

ggsave('bootstrap_means.pdf')


### Cohensd 

print("engaged")
cq_perfect_tota_correct = perfects %>% dplyr::filter(condition=="CQ") %>% select(total_correct)
ir_perfect_tota_correct = perfects %>% dplyr::filter(condition=="IR") %>% select(total_correct)
d_engaged = cohen.d(cq_perfect_tota_correct$total_correct, ir_perfect_tota_correct$total_correct)
d_engaged = toString(signif(d_engaged$estimate, digits=3))
writeLines(d_engaged,  "d_engaged.txt")

deltaCQengaged = mean(cq_perfect_tota_correct$total_correct) - mean(ir_perfect_tota_correct$total_correct)
deltaCQengaged = toString(signif(deltaCQengaged, digits=3))
writeLines(deltaCQengaged, "deltaCQengaged.txt")

print("all")
df = read_csv('turk.csv')
cq_tota_correct = df %>% dplyr::filter(condition=="CQ") %>% select(total_correct)
ir_tota_correct = df %>% dplyr::filter(condition=="IR") %>% select(total_correct)
d_all = cohen.d(cq_tota_correct$total_correct, ir_tota_correct$total_correct)
d_all = toString(signif(d_all$estimate, digits=3))
writeLines(d_all, "d_all.txt")
writeLines(toString(nrow(df)), "totalN.txt")


deltaCQall = mean(cq_tota_correct$total_correct) - mean(ir_tota_correct$total_correct)
deltaCQall = toString(signif(deltaCQall, digits=3))
writeLines(deltaCQall, "deltaCQall.txt")