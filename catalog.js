// Only confirmed menu entries and independently routed product pages are listed here.
const OPS_CATALOG = (() => {
  const menus = {
    teacher: [
      ['teacher_home', '首页'],
      ['teacher_dashboard', '数据看板'],
      ['teacher_bank', '题库管理'],
      ['teacher_homework', '作业管理'],
      ['teacher_entrance', '入学测试'],
      ['teacher_students', '学员管理'],
      ['teacher_resources', '教学资料'],
      ['teacher_system', '系统管理'],
      ['teacher_infra', '基础设施']
    ],
    student: [
      ['student_home', '首页'],
      ['student_homework', '作业'],
      ['student_bank', '题库'],
      ['student_wrong', '错题']
    ]
  }

  const menuNames = { ...Object.fromEntries(Object.values(menus).flat()), student_topbar: '顶栏通知' }
  const exposureOnly = ['teacher_system', 'teacher_infra']
  const menu = (id, name, group, source, reach, features, path = '') => ({
    id, name, groups: [group], kind: 'menu', source, reach, features, path, parent: ''
  })
  const route = (id, name, groups, parent, path, source, reach, features) => ({
    id, name, groups: [].concat(groups), parent, kind: 'route', path, source, reach, features
  })
  const bankTabs = ['bank_scope_switch', '切换系统题库 / 分校题库', .94, .29]
  const bankQuestions = ['question_management_open', '题目管理', .83, .34]
  const bankSearch = ['bank_search', '查询题库', .93, .31]
  const homeworkDetail = ['homework_detail_open', '详情', .93, .45]
  const homeworkExport = ['homework_list_export', '导出', .87, .11]
  const assignOpen = ['homework_assign_open', '布置作业', .94, .30]
  const assignPublish = ['homework_publish', '发布', .36, .55, .94]
  const draftSave = ['homework_draft_save', '保存草稿', .36, .22, .97]
  const commentSave = ['homework_comment_save', '发表评语', .79, .45, .94]
  const resourceUpload = ['resource_upload_open', '上传资料', .87, .27]
  const resourcePreview = ['resource_preview', '预览', .79, .36]
  const analysisTab = ['report_analysis_switch', '答题解析', .87, .43]
  const commentsTab = ['report_comments_switch', '评语', .57, .27]
  const wrongPractice = ['wrong_practice', '开始练习', .59, .47]

  const teacher = [
    menu('t_home', '首页', 'teacher_home', 'Home/Index.vue', 125, [
      ['notice_detail_open', '查看公告', .49, .31]
    ], '/index'),
    menu('t_dashboard', '数据看板', 'teacher_dashboard', 'dashboard/index.vue', 57, [
      ['dashboard_scope_switch', '切换团队 / 本人', .85, .28],
      ['dashboard_detail_open', '查看详情', .90, .35]
    ], '/dashboard'),
    route('t_dashboard_period', '周期服务统计详情', 'teacher_dashboard', '数据看板',
      '/student-service/dashboard/period-detail', 'dashboard/period-detail/index.vue', 13, [
        ['dashboard_export', '导出', .74, .19]
      ]),
    menu('t_bank_ielts', '雅思题库', 'teacher_bank', 'questionBank/ielts/index.vue', 47, [
      bankTabs, bankSearch, ['bank_exam_preview', '机考预览', .62, .32], bankQuestions,
      ['bank_status_open', '设置状态', .58, .22], ['bank_recording_edit', '修改录题', .56, .32]
    ], '/question-bank/ielts'),
    menu('t_bank_toefl', '托福题库', 'teacher_bank', 'questionBank/toefl/index.vue', 41, [
      bankTabs, bankSearch, ['bank_exam_preview', '机考预览', .61, .32], bankQuestions,
      ['bank_recording_edit', '修改录题', .53, .28]
    ]),
    menu('t_bank_lxyb', '留学预备题库', 'teacher_bank', 'questionBank/lxyb/index.vue', 24, [
      bankTabs, bankSearch, ['bank_exam_preview', '预览', .63, .32], bankQuestions
    ]),
    menu('t_bank_sat', 'SAT题库', 'teacher_bank', 'questionBank/sat/index.vue', 21, [
      bankTabs, bankSearch, ['bank_exam_preview', '预览', .60, .32], bankQuestions
    ]),
    menu('t_bank_category', '分类管理', 'teacher_bank', 'questionBank/ielts/operationCategory/index.vue', 11, [
      ['category_create_open', '新增顶级', .79, .23], ['category_child_open', '子分类', .75, .31]
    ]),
    route('t_question_ielts', '题目管理', 'teacher_bank', '雅思题库', '/question-bank/question-management/:id',
      'questionBank/ielts/questionManagement/index.vue', 16, []),
    route('t_question_toefl', '新托福题目管理', 'teacher_bank', '托福题库', '/question-bank/toefl-question-management/:id',
      'questionBank/toefl/questionManagement/index.vue', 14, []),
    route('t_question_lxyb', '留学预备题目管理', 'teacher_bank', '留学预备题库', '/question-bank/lxyb-question-management/:id',
      'questionBank/lxyb/questionManagement/index.vue', 8, []),
    route('t_question_sat', 'SAT题目管理', 'teacher_bank', 'SAT题库', '/question-bank/sat-question-management/:id',
      'questionBank/sat/questionManagement/index.vue', 7, []),
    route('t_ielts_preview', '雅思机考预览', 'teacher_bank', '雅思题库', '/exam/ielts/preview',
      'exam/ielts/session/[id].vue', 12, []),
    route('t_toefl_preview', '新托福机考预览', 'teacher_bank', '托福题库', '/exam/toefl/preview',
      'exam/toefl/session/ExamToeflSession.vue', 11, []),
    route('t_lxyb_preview', '留学预备题库预览', 'teacher_bank', '留学预备题库', '/exam/lxyb/preview',
      'exam/lxyb/session/LxybPreviewPage.vue', 6, []),
    route('t_sat_preview', 'SAT题库预览', 'teacher_bank', 'SAT题库', '/exam/sat/preview',
      'exam/sat/session/SatPreviewPage.vue', 5, []),
    menu('t_homework_all', '全部作业', 'teacher_homework', 'homework/list.vue', 129, [
      homeworkDetail, homeworkExport, assignOpen, assignPublish, draftSave
    ]),
    menu('t_homework_grading', '我的批改', 'teacher_homework', 'homework/GradingList.vue', 89, [
      homeworkDetail, homeworkExport, assignOpen, assignPublish, draftSave
    ]),
    menu('t_homework_assigned', '我布置的', 'teacher_homework', 'homework/AssignedList.vue', 68, [
      homeworkDetail, homeworkExport, assignOpen, assignPublish, draftSave
    ]),
    menu('t_homework_collected', '我的收藏', 'teacher_homework', 'homework/CollectedList.vue', 26, [
      homeworkDetail, homeworkExport, assignOpen, assignPublish, draftSave
    ]),
    menu('t_homework_drafts', '我的草稿', 'teacher_homework', 'homework/DraftList.vue', 33, [
      ['homework_draft_edit', '编辑', .81, .43], homeworkDetail, homeworkExport, assignOpen, assignPublish, draftSave
    ]),
    menu('t_classroom_push', '课中推题', 'teacher_homework', 'classroomPush/index.vue', 28, [
      ['push_drawer_open', '课中推题', .89, .31], ['classroom_push_create', '立即推题', .32, .50, .96],
      ['classroom_monitor_open', '详情', .74, .35]
    ]),
    menu('t_class_learning', '学情数据', 'teacher_homework', 'homework/semesterData/index.vue', 33, [
      ['learning_detail_open', '查看详情', .78, .34]
    ]),
    route('t_homework_detail', '作业详情', 'teacher_homework', '', '/homework/detail/:id',
      'homework/HomeworkDetail.vue', 72, [
        ['homework_grade_open', '查看作业详情报告', .56, .43],
        ['homework_reassign_open', '再次布置', .76, .18],
        ['homework_reassign_submit', '确定（再次布置）', .20, .48, .95]
      ]),
    route('t_custom_grading', '自定义作业阅卷', 'teacher_homework', '作业详情',
      '/homework/grading/custom/:homeworkId', 'homework/grading/HomeworkCustomGradingPage.vue', 22, [commentSave]),
    route('t_mock_grading', '模考作业阅卷', 'teacher_homework', '作业详情',
      '/homework/grading/mock/:homeworkId', 'homework/grading/HomeworkMockGradingPage.vue', 38, [commentSave]),
    route('t_classroom_detail', '课中推题详情', 'teacher_homework', '课中推题',
      '/classroom-push/detail/:id', 'classroomPush/detail.vue', 15, [
        ['classroom_push_end', '结束练习', .56, .37, .98]
      ]),
    menu('t_entrance_paper', '试卷管理', 'teacher_entrance', 'entranceTest/paper/index.vue', 28, [
      ['entrance_paper_open', '组卷', .82, .32], ['entrance_invite', '发起测试', .77, .37],
      ['entrance_preview', '预览', .79, .29]
    ]),
    menu('t_entrance_attempt', '考试记录', 'teacher_entrance', 'entranceTest/attempt/index.vue', 24, [
      ['entrance_report_open', '查看报告', .72, .38]
    ]),
    route('t_entrance_grading', '入学测试批改', 'teacher_entrance', '考试记录',
      '/entrance-test/attempt/grading', 'entranceTest/attempt/EntranceTestAttemptGradingPage.vue', 10, []),
    menu('t_student_list', '学员列表', 'teacher_students', 'student-management/student/index.vue', 47, [
      ['student_learning_open', '学情', .83, .37], ['student_score_open', '学员成绩', .81, .31]
    ]),
    menu('t_student_scores', '成绩管理', 'teacher_students', 'student-service/care/fs-exam-score/index.vue', 27, [
      ['score_create_open', '新增成绩', .72, .39], ['score_save', '保存', .27, .51, .94]
    ]),
    menu('t_resource_shared', '共享资料', 'teacher_resources', 'teachingResource/shared/index.vue', 35, [
      resourceUpload, resourcePreview
    ]),
    menu('t_resource_personal', '个人资料', 'teacher_resources', 'teachingResource/personal/index.vue', 23, [
      resourceUpload, resourcePreview
    ])
  ]

  const examGroups = ['student_homework', 'student_bank', 'student_wrong']
  const student = [
    menu('s_home', '首页', 'student_home', 'student/home/index.vue', 408, [], '/student/home'),
    menu('s_homework', '作业', 'student_homework', 'student/homework/index.vue', 531, [
      ['homework_status_switch', '切换作业分类', .97, .43],
      ['homework_enter', '进入作业', .71, .62],
      ['homework_resume', '继续作答', .43, .54],
      ['homework_report_open', '查看结果', .68, .47],
      ['homework_search', '搜索', .91, .24],
      ['homework_collect', '收藏 / 取消收藏', .79, .15]
    ], '/student/homework'),
    menu('s_bank', '题库', 'student_bank', 'student/question-bank/index.vue', 325, [
      ['bank_tab_switch', '切换题库 / 已完成题库', .98, .45],
      ['bank_practice', '练习模式', .66, .52],
      ['bank_mock', '模考模式', .66, .36],
      ['bank_search', '搜索', .91, .23]
    ], '/student/question-bank'),
    menu('s_wrong', '错题', 'student_wrong', 'student/wrong-question/index.vue', 137, [
      ['wrong_product_switch', '切换产品', .93, .38], ['wrong_detail_open', '查看详情', .78, .54]
    ], '/student/wrong-questions'),
    route('s_custom_answer', '自定义作业', 'student_homework', '作业', '/student/homework/custom',
      'exam/custom/StudentCustomHomeworkPage.vue', 108, [['answer_submit', '交卷', .77, .56, .97]]),
    route('s_custom_report', '自定义作业报告', 'student_homework', '作业', '/student/test/custom/report/:homeworkRecordId',
      'student/test/custom/StudentCustomHomeworkReportPage.vue', 91, [commentsTab]),
    route('s_ielts_exam', '雅思机考', examGroups, '', '/exam/ielts/mock',
      'exam/ielts/session/[id].vue', 162, [['answer_submit', 'Finish test', .77, .56, .97]]),
    route('s_toefl_exam', '新托福机考', examGroups, '', '/exam/toefl/mock',
      'exam/toefl/session/ExamToeflSession.vue', 142, [['answer_submit', 'Submit', .77, .56, .97]]),
    route('s_lxyb_exam', '留学预备机考', examGroups, '', '/exam/lxyb/exam',
      'exam/lxyb/session/LxybExamPage.vue', 75, [['answer_submit', '提交', .77, .56, .97]]),
    route('s_sat_exam', 'SAT机考', examGroups, '', '/exam/sat/session',
      'exam/sat/session/SatExamSessionPage.vue', 62, [['answer_submit', 'Submit', .77, .56, .97]]),
    route('s_ielts_report', '雅思报告', examGroups, '', '/student/test/ielts/report/:recordId',
      'student/test/ielts/report/IeltsReport.vue', 118, [analysisTab, commentsTab]),
    route('s_toefl_report', '新托福报告', examGroups, '', '/student/test/toefl/report/:recordId',
      'student/test/toefl/report/ToeflReport.vue', 104, [analysisTab, commentsTab]),
    route('s_lxyb_report', '留学预备报告', examGroups, '', '/student/test/lxyb/report/:recordId',
      'student/test/lxyb/report/LxybReportPage.vue', 57, [analysisTab, commentsTab]),
    route('s_sat_report', 'SAT报告', examGroups, '', '/student/test/sat/report/:recordId',
      'student/test/sat/report/StudentSatReportPage.vue', 44, [analysisTab]),
    route('s_ielts_wrong', '错题详情（雅思）', 'student_wrong', '错题', '/student/wrong-questions/ielts/detail',
      'student/wrong-question/ielts-detail.vue', 45, [wrongPractice]),
    route('s_toefl_wrong', '错题详情（新托福）', 'student_wrong', '错题', '/student/wrong-questions/toefl/detail',
      'student/wrong-question/toefl-detail.vue', 33, [wrongPractice]),
    route('s_lxyb_wrong', '错题详情（留学预备）', 'student_wrong', '错题', '/student/wrong-questions/lxyb/detail',
      'student/wrong-question/lxyb-detail.vue', 19, [wrongPractice]),
    route('s_sat_wrong', '错题详情（SAT）', 'student_wrong', '错题', '/student/wrong-questions/sat/detail',
      'student/wrong-question/sat-detail.vue', 17, [wrongPractice]),
    route('s_notifications', '我的站内信', 'student_topbar', '', '/student/notify-messages',
      'student/notify/MyNotifyMessagePage.vue', 33, [
        ['notification_detail_open', '详情 / 已读', .80, .39],
        ['notification_all_read', '全部已读', .74, .21, .96]
      ])
  ]

  const featureNotes = {
    notice_detail_open: '点击首页「通知公告」下的一条公告，打开详情弹窗。',
    dashboard_scope_switch: '点击顶部「查看团队数据」或「仅查看本人数据」，切换统计范围。',
    dashboard_detail_open: '点击「周期内服务数据统计」标题旁的「查看详情」，进入周期明细。',
    dashboard_export: '点击周期详情中「按教师」或「按学员」页签的「导出」。',
    bank_scope_switch: '点击题库列表上方的「系统题库」或「分校题库」。',
    bank_search: '使用题库列表筛选栏的「搜索」或搜索图标，按当前条件查询。',
    bank_exam_preview: '勾选题库后点工具栏的「机考预览」，也可点行内「预览」。',
    question_management_open: '点击题库行末操作区的「题目管理」，查看和维护这条题库的题目。',
    bank_status_open: '在系统题库勾选条目后，点工具栏的「设置状态」，打开设置入口。',
    bank_recording_edit: '点击题库行末的「修改录题」，打开录题编辑。',
    category_create_open: '点击分类列表上方的「新增顶级」，打开新增表单。',
    category_child_open: '点击分类行末的「子分类」，查看该分类下的子项。',
    homework_detail_open: '点击作业列表行末的「详情」，进入这份作业的详情页。',
    homework_list_export: '点击作业列表筛选区的「导出」，发起当前列表的导出。',
    homework_assign_open: '点击作业列表上方的「布置作业」，打开布置作业抽屉。',
    homework_publish: '在布置作业抽屉底部点「发布」。后端确认发布后计成功。',
    homework_draft_save: '在布置作业抽屉底部点「保存草稿」。草稿保存完成后计成功。',
    homework_draft_edit: '点击草稿所在行的「编辑」，在抽屉中继续填写。',
    homework_grade_open: '点击作业详情「参与学生」表格行末的「查看作业详情报告」，进入阅卷。',
    homework_reassign_open: '点击作业详情顶部的「再次布置」，打开复用这份作业的抽屉。',
    homework_reassign_submit: '在「再次布置」打开的抽屉底部点「确定」。布置完成后计成功。',
    homework_comment_save: '点击阅卷页的「添加评语」，填写后点「发表评语」。发表完成后计成功。',
    push_drawer_open: '点击课中推题列表上方的「课中推题」，打开新建推题抽屉。',
    classroom_push_create: '在新建推题抽屉最后一步点「立即推题」。创建完成后计成功。',
    classroom_monitor_open: '点击课中推题记录行末的「详情」，进入该次推题的监控页。',
    classroom_push_end: '在推题监控页点「结束练习」并确认。后端结束后计成功。',
    learning_detail_open: '点击学情数据里某个学员行末的「查看详情」，打开该学员的学情抽屉。',
    entrance_paper_open: '点击试卷管理列表上方的「组卷」，打开入学测试组卷表单。',
    entrance_invite: '点击已启用试卷行末的「发起测试」，打开邀请弹窗。',
    entrance_preview: '点击试卷管理行末的「预览」，打开这份试卷的预览。',
    entrance_report_open: '点击考试记录行末的「查看报告」，打开该学员的入学测试批改页。',
    student_learning_open: '点击学员列表行末的「学情」，打开这位学员的学情抽屉。',
    student_score_open: '点击学员列表行末的「学员成绩」，打开这位学员的成绩弹窗。',
    score_create_open: '点击成绩管理列表上方的「新增成绩」，打开录入表单。',
    score_save: '在成绩表单底部点「保存」。成绩写入后计成功。',
    resource_upload_open: '点击资料列表上方的「上传资料」，打开上传弹窗。',
    resource_preview: '点击资料行末的「预览」，打开对应文件的预览。',
    homework_status_switch: '点击作业页左侧的分类，例如「待完成」「进行中」或「已批改」。',
    homework_enter: '点击未开始作业卡片上的「进入作业」，尝试打开作答页。',
    homework_resume: '点击进行中作业卡片上的「继续作答」，回到已有作答记录。',
    homework_report_open: '点击已完成作业卡片上的「查看结果」，打开成绩或作答报告。',
    homework_search: '在作业页输入标题后，点击输入框旁的「搜索」。',
    homework_collect: '点击作业卡片右下角的星标，收藏或取消收藏该作业。',
    bank_tab_switch: '点击题库页顶部的「题库」或「已完成题库」，切换列表。',
    bank_practice: '在题库卡片显示操作按钮后点「练习模式」，进入自主练习。',
    bank_mock: '在题库卡片显示操作按钮后点「模考模式」，进入模考。',
    wrong_product_switch: '点击错题统计上方的雅思、新托福、留学预备或 SAT，切换统计内容。',
    wrong_detail_open: '点击错题统计表格行末的「查看详情」，查看对应错题。',
    wrong_practice: '在错题详情点「开始练习」，用该组错题发起练习。',
    report_analysis_switch: '点报告页的「答题解析」页签，查看作答与解析。',
    report_comments_switch: '点报告页的「评语」页签，查看教师评语。',
    notification_detail_open: '点击站内信行末的「详情」或「已读」，打开该条消息。',
    notification_all_read: '点击站内信列表上方的「全部已读」。状态更新后计成功。'
  }

  const bankPreviewNote = '点击题库行末的「预览」，也可勾选后点工具栏的「预览」。'
  const pageFeatureNotes = {
    t_bank_ielts: { bank_search: '在题库列表顶部输入名称，点放大镜或用筛选按钮发起查询。' },
    t_bank_lxyb: { bank_exam_preview: bankPreviewNote },
    t_bank_sat: { bank_exam_preview: bankPreviewNote },
    s_bank: { bank_search: '在题库页搜索框输入题目，点击右侧放大镜或按回车。' },
    s_custom_answer: { answer_submit: '点击作答页的「交卷」，再点确认弹窗的「交卷」。作业提交完成后计成功。' },
    s_ielts_exam: { answer_submit: '在最后一个科目点「Finish test」，再点弹窗里的「OK」。最终交卷完成后计成功。' },
    s_toefl_exam: { answer_submit: '在「End of session」结束页点「Submit」。最终交卷完成后计成功。' },
    s_lxyb_exam: { answer_submit: '点右上角「提交」。有未答题时，再点「仍提交」。最终交卷完成后计成功。' },
    s_sat_exam: { answer_submit: '在最后一个模块的检查页点右下角「Submit」。最终交卷完成后计成功。' }
  }

  function describeFeature(pageId, featureId) {
    return pageFeatureNotes[pageId]?.[featureId] ?? featureNotes[featureId]
  }

  return { menus, menuNames, exposureOnly, describeFeature, pages: { teacher, student } }
})()
