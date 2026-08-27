name: 功能建议
about: 提出新功能或改进建议
title: "[建议] "
labels: enhancement
body:
  - type: textarea
    id: problem
    attributes:
      label: 想要解决的问题
      description: 这个功能是为了解决什么痛点？
      placeholder: 例如：希望在大屏幕上能……
    validations:
      required: true
  - type: textarea
    id: solution
    attributes:
      label: 期望的方案
      description: 你理想中的交互或效果是怎样的？
    validations:
      required: false
  - type: textarea
    id: extra
    attributes:
      label: 补充说明
    validations:
      required: false
