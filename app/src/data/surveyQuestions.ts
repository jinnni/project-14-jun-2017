export default [
  {
    id: 1,
    surveyId: 1,
    level: 0,
    title: "你会在大型超市/零售商场购物吗？",
    notice: "为了帮助我们给你推荐适用你的产品，需要几分钟时间来完成问卷。为了找出变化，几个月后我们会问同样的问题。",
    description: "你一般在以下哪个大型城购买产售商城购买产品？",
    // added 'as'
    // because the first "multiple" interpreted as string
    // not as string literal type
    // probably a bug
    type: "multiple" as "multiple",
    conditions: [
      {
        condition: "4 and 3",
        childQuestions: [3]
      },
      {
        condition: "(1 OR 2) AND 5",
        childQuestions: [5]
      },
      {
        condition: "((6 OR 2) AND (5 or 3)) or 9",
        childQuestions: [2, 5]
      },
      {
        condition: "7",
        childQuestions: [2]
      }
    ],
    choices: [{
      code: 1,
      title: "麦德龙"
    }, {
      code: 2,
      title: "宜家"
    }, {
      code: 3,
      title: "山姆会员商店",
      customInput: true
    }, {
      code: 4,
      title: "家乐福"
    }, {
      code: 5,
      title: "乐购"
    }, {
      code: 6,
      title: "好又多"
    }, {
      code: 7,
      title: "大润发"
    }, {
      code: 8,
      title: "沃尔玛"
    }, {
      code: 9,
      title: "这里没有",
      customInput: true
    }]
  },
  {
    id: 2,
    surveyId: 1,
    level: 0,
    title: "你一般怎么购买产品？",
    type: "single" as "single",
    choices: [{
      code: 1,
      title: "麦德龙"
    }, {
      code: 2,
      title: "宜家"
    }, {
      code: 3,
      title: "好又多"
    }, {
      code: 4,
      title: "这里没有",
      customInput: true
    }],
    conditions: [
      {
        condition: "4",
        childQuestions: [4]
      }, {
        condition: "(1 OR 2) or 3",
        childQuestions: [3]
      }
    ]
  },
  {
    id: 3,
    surveyId: 1,
    level: 0,
    description: "你的一个月收入是多少？",
    type: "dropdown" as "dropdown",
    choices: [{
      code: 1,
      title: "1000~10000"
    }, {
      code: 2,
      title: "10000~20000"
    }, {
      code: 3,
      title: "20000 以上"
    }]
  },
  {
    id: 4,
    surveyId: 1,
    level: 0,
    title: "其他意见",
    type: "opentext" as "opentext",
    minimumCharacters: 20
  },
  {
    id: 5,
    surveyId: 1,
    level: 0,
    title: "请选择最恰当的选项",
    notice: "为了帮助我们给你推荐适用你的产品，需要几分钟时间来完成问卷。为了找出变化，几个月后我们会问同样的问题。",
    description: "你一般在以下哪个大型城购买产售商城购买产品？",
    type: "intensity" as "intensity",
    subjects: [{
      code: 1,
      title: "这个产品怎么样？",
      choices: [{
        code: 1,
        title: "非常不好"
      }, {
        code: 2,
        title: "不好"
      }, {
        code: 3,
        title: "还可以"
      }, {
        code: 4,
        title: "好"
      }, {
        code: 5,
        title: "非常好"
      }]
    }, {
      code: 2,
      title: "那个产品怎么样？",
      choices: [{
        code: 1,
        title: "very good"
      }, {
        code: 2,
        title: "good"
      }, {
        code: 3,
        title: "okay"
      }, {
        code: 4,
        title: "bad"
      }, {
        code: 5,
        title: "very bad"
      }]
    }, {
      code: 3,
      title: "适合你吗？",
      choices: [{
        code: 1,
        title: "非常适合"
      }, {
        code: 2,
        title: "适合"
      }, {
        code: 3,
        title: "一般"
      }, {
        code: 4,
        title: "不适合"
      }, {
        code: 5,
        title: "非常不适合"
      }]
    }],
    conditions: [
      {
        condition: "1.1 or (2.1 and 3.3)",
        childQuestions: [4]
      }
    ]
  }
];
