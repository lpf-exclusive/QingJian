name: Bug 报告
about: 报告一个可复现的错误或异常
title: "[Bug] "
labels: bug
body:
  - type: input
    id: version
    attributes:
      label: 轻笺版本
      description: 设置 → 关于轻笺 中显示的版本号
      placeholder: 如 1.3.27
    validations:
      required: true
  - type: input
    id: system
    attributes:
      label: 操作系统
      placeholder: Windows 11 23H2
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: 复现步骤
      description: 一步步描述如何触发问题
      placeholder: |
        1. 打开轻笺
        2. 点击……
        3. 出现……
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: 期望结果
    validations:
      required: false
  - type: textarea
    id: actual
    attributes:
      label: 实际结果
    validations:
      required: false
  - type: textarea
    id: logs
    attributes:
      label: 诊断日志
      description: 设置 → 诊断 → 导出诊断日志 的内容（可脱敏）
    validations:
      required: false
