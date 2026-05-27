import sys
f=open("src/components/SubtitleOverlay.vue","rb")
c=f.read().decode("utf-8")
f.close()
old = '  @click="\n            style.position = p as any\n            emitStyle()\n          "'
new = '  @click="style.position = p as any; emitStyle()"'
c = c.replace(old,new)
old = '  @click="\n            style.align = a as any\n            emitStyle()\n          "'
new = '  @click="style.align = a as any; emitStyle()"'
c = c.replace(old,new)
f=open("src/components/SubtitleOverlay.vue","wb")
f.write(c.encode("utf-8"))
f.close()
print("done")
