name: 反馈与建议
about: 提交使用反馈、吐槽、建议或一般咨询
title: "[反馈] "
labels: feedback
body:
  - type: markdown
    attributes:
      value: |
        感谢使用轻笺！请尽量提供以下信息，帮助我们更快理解你的反馈。
        轻笺不收集遥测数据，因此你的描述对我们非常重要。
  - type: input
    id: version
    attributes:
      label: 轻笺版本
      description: 设置 → 关于轻笺 中显示的版本号（如 1.3.27）
      placeholder: 如 1.3.27
    validations:
      required: false
  - type: input
    id: system
    attributes:
      label: 操作系统
      description: 如 Windows 11 23H2 / Windows 10
      placeholder: Windows 11 23H2
    validations:
      required: false
  - type: textarea
    id: desc
    attributes:
      label: 反馈内容
      description: 问题描述、期望行为、截图或日志等
      placeholder: 请描述你的反馈或建议……
    validations:
      required: true
  - type: markdown
    attributes:
      value: |
        如有诊断日志：设置 → 诊断 → 导出诊断日志，将文件内容粘贴到上方或作为附件上传。
