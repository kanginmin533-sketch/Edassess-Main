
```
EDAssess2-main old
├─ .kilo
├─ backend
│  ├─ accounts
│  │  ├─ activity.py
│  │  ├─ admin.py
│  │  ├─ apps.py
│  │  ├─ management
│  │  │  ├─ commands
│  │  │  │  ├─ create_instructor.py
│  │  │  │  ├─ fix_sequence.py
│  │  │  │  └─ __init__.py
│  │  │  └─ __init__.py
│  │  ├─ migrations
│  │  │  ├─ 0001_initial.py
│  │  │  ├─ 0002_rolepermission.py
│  │  │  ├─ 0003_systemsettings.py
│  │  │  ├─ 0004_user_department.py
│  │  │  ├─ 0005_alter_user_department.py
│  │  │  ├─ 0006_user_major_activitylog.py
│  │  │  ├─ 0007_departmentpermission.py
│  │  │  └─ __init__.py
│  │  ├─ models.py
│  │  ├─ permissions.py
│  │  ├─ serializers.py
│  │  ├─ urls.py
│  │  ├─ views.py
│  │  └─ __init__.py
│  ├─ config
│  │  ├─ asgi.py
│  │  ├─ settings.py
│  │  ├─ urls.py
│  │  ├─ wsgi.py
│  │  └─ __init__.py
│  ├─ exams
│  │  ├─ admin.py
│  │  ├─ apps.py
│  │  ├─ migrations
│  │  │  ├─ 0001_initial.py
│  │  │  ├─ 0002_examconfig.py
│  │  │  ├─ 0003_exam_category_exam_status.py
│  │  │  ├─ 0004_remove_question_exam_exam_questions_and_more.py
│  │  │  ├─ 0005_question_explanation_question_subject_and_more.py
│  │  │  ├─ 0006_examattempt_detail.py
│  │  │  ├─ 0007_exam_department_question_department.py
│  │  │  ├─ 0008_choice_explanation.py
│  │  │  ├─ 0009_alter_choice_text.py
│  │  │  ├─ 0010_alter_exam_department_alter_question_department.py
│  │  │  ├─ 0011_exam_major_question_major.py
│  │  │  └─ __init__.py
│  │  ├─ models.py
│  │  ├─ serializers.py
│  │  ├─ urls.py
│  │  ├─ views.py
│  │  └─ __init__.py
│  ├─ manage.py
│  ├─ modules
│  │  ├─ admin.py
│  │  ├─ apps.py
│  │  ├─ migrations
│  │  │  ├─ 0001_initial.py
│  │  │  ├─ 0002_announcement.py
│  │  │  ├─ 0003_module_department.py
│  │  │  ├─ 0004_module_major_alter_module_department.py
│  │  │  └─ __init__.py
│  │  ├─ models.py
│  │  ├─ serializers.py
│  │  ├─ urls.py
│  │  ├─ views.py
│  │  └─ __init__.py
│  ├─ reports
│  │  ├─ admin.py
│  │  ├─ apps.py
│  │  ├─ migrations
│  │  │  └─ __init__.py
│  │  ├─ models.py
│  │  ├─ serializers.py
│  │  ├─ urls.py
│  │  ├─ views.py
│  │  └─ __init__.py
│  └─ requirements.txt
└─ frontend
   ├─ eslint.config.js
   ├─ index.html
   ├─ package-lock.json
   ├─ package.json
   ├─ public
   │  ├─ favicon.svg
   │  └─ icons.svg
   ├─ README.md
   ├─ src
   │  ├─ api
   │  │  ├─ accessApi.js
   │  │  ├─ activityApi.js
   │  │  ├─ adminApi.js
   │  │  ├─ authApi.js
   │  │  ├─ axiosInstance.js
   │  │  ├─ examApi.js
   │  │  ├─ modulesApi.js
   │  │  ├─ questionApi.js
   │  │  ├─ reportApi.js
   │  │  ├─ settingsApi.js
   │  │  └─ userApi.js
   │  ├─ App.css
   │  ├─ App.jsx
   │  ├─ assets
   │  │  ├─ CTELogo.jpg
   │  │  └─ prmsu.jpg
   │  ├─ auth
   │  │  ├─ ProtectedRoute.jsx
   │  │  ├─ RoleGuard.jsx
   │  │  ├─ SuperAdminGuard.jsx
   │  │  └─ useAuthStore.js
   │  ├─ components
   │  │  ├─ AuthModal.jsx
   │  │  ├─ CTASection.jsx
   │  │  ├─ CTESection.jsx
   │  │  ├─ DeptPicker.jsx
   │  │  ├─ FeaturesShowcase.jsx
   │  │  ├─ Footer.jsx
   │  │  ├─ Hero.jsx
   │  │  ├─ Icon3D.jsx
   │  │  ├─ MacSection.jsx
   │  │  ├─ MajorPicker.jsx
   │  │  ├─ MissionVision.jsx
   │  │  ├─ Navbar.jsx
   │  │  ├─ PlatformSection.jsx
   │  │  ├─ ProductPreview.jsx
   │  │  ├─ ProfileModal.jsx
   │  │  └─ ui
   │  │     ├─ Button.jsx
   │  │     ├─ Input.jsx
   │  │     ├─ Modal.jsx
   │  │     └─ Spinner.jsx
   │  ├─ hooks
   │  │  ├─ useAuth.js
   │  │  ├─ useExam.js
   │  │  ├─ useExamHistory.js
   │  │  ├─ useFetch.js
   │  │  ├─ useQuestionBank.js
   │  │  └─ useReviewModules.js
   │  ├─ index.css
   │  ├─ main.jsx
   │  ├─ pages
   │  │  ├─ admin
   │  │  │  ├─ AccessControlPage.jsx
   │  │  │  ├─ ActivityLogPage.jsx
   │  │  │  ├─ admin.css
   │  │  │  ├─ AdminDashboard.jsx
   │  │  │  ├─ AdminLayout.jsx
   │  │  │  ├─ ExamConfigPage.jsx
   │  │  │  ├─ index.js
   │  │  │  ├─ ModulesPage.jsx
   │  │  │  ├─ ReportsPage.jsx
   │  │  │  ├─ SettingsPage.jsx
   │  │  │  └─ UserPage.jsx
   │  │  ├─ instructor
   │  │  │  ├─ AnnouncementsPage.jsx
   │  │  │  ├─ ExamBuilderPage.jsx
   │  │  │  ├─ index.js
   │  │  │  ├─ instructor.css
   │  │  │  ├─ InstructorDashboard.jsx
   │  │  │  ├─ InstructorLayout.jsx
   │  │  │  ├─ ModulesPage.jsx
   │  │  │  ├─ QuestionBankPage.jsx
   │  │  │  └─ StudentMonitorPage.jsx
   │  │  └─ user
   │  │     ├─ cit.css
   │  │     ├─ CitUserLayout.jsx
   │  │     ├─ cte.css
   │  │     ├─ ExamPage.jsx
   │  │     ├─ ExamSelectionPage.jsx
   │  │     ├─ ResultsPage.jsx
   │  │     ├─ ReviewModulesPage.jsx
   │  │     ├─ user.css
   │  │     ├─ UserAssessmentsPage.jsx
   │  │     ├─ UserDashboard.jsx
   │  │     ├─ UserLayout.jsx
   │  │     └─ user_index.js
   │  ├─ styles
   │  │  ├─ AuthModal.css
   │  │  ├─ CTASection.css
   │  │  ├─ CTESection.css
   │  │  ├─ dept-theme.css
   │  │  ├─ FeaturesShowcase.css
   │  │  ├─ Footer.css
   │  │  ├─ globals.css
   │  │  ├─ Hero.css
   │  │  ├─ MacSection.css
   │  │  ├─ MissionVision.css
   │  │  ├─ Navbar.css
   │  │  ├─ PlatformSection.css
   │  │  └─ ProductPreview.css
   │  └─ utils
   │     ├─ apiError.js
   │     ├─ formatDate.js
   │     ├─ gwa.js
   │     ├─ majors.js
   │     ├─ sanitize.js
   │     └─ validators.js
   └─ vite.config.js

```