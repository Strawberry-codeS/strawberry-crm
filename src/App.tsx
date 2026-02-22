/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  X,
  UserPlus,
  HelpCircle,
  LayoutGrid,
  Key,
  UserCircle,
  Loader2,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, DashboardStats, StudentStatus, StudentStage } from './types';
import { getStudents, createStudent, deleteStudent } from './api/students';
import { getStats } from './api/stats';

export default function App() {
  // ── 数据状态 ──────────────────────────────────────────────
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── UI 状态 ───────────────────────────────────────────────
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── 表单状态 ──────────────────────────────────────────────
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAge, setFormAge] = useState('');
  const [formStatus, setFormStatus] = useState<StudentStatus>('explore_3');
  const [formStage, setFormStage] = useState<StudentStage>('opportunity');
  const [formPauseTime, setFormPauseTime] = useState('');
  const [formCurrentTask, setFormCurrentTask] = useState('');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formTagInput, setFormTagInput] = useState('');
  const [formCategory, setFormCategory] = useState('');

  // ── 暗色模式 ──────────────────────────────────────────────
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // ── 加载数据 ──────────────────────────────────────────────
  const loadStudents = useCallback(async (search?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getStudents(search);
      setStudents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载学生数据失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch {
      // 统计数据加载失败不影响主流程，静默处理
    }
  }, []);

  useEffect(() => {
    loadStudents();
    loadStats();
  }, [loadStudents, loadStats]);

  // ── 搜索（防抖） ───────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      loadStudents(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, loadStudents]);

  // ── 添加标签 ──────────────────────────────────────────────
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && formTagInput.trim()) {
      e.preventDefault();
      const tag = formTagInput.trim();
      if (!formTags.includes(tag)) {
        setFormTags(prev => [...prev, tag]);
      }
      setFormTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormTags(prev => prev.filter(t => t !== tag));
  };

  // ── 重置表单 ──────────────────────────────────────────────
  const resetForm = () => {
    setFormName('');
    setFormPhone('');
    setFormAge('');
    setFormStatus('explore_3');
    setFormStage('opportunity');
    setFormPauseTime('');
    setFormCurrentTask('');
    setFormTags([]);
    setFormTagInput('');
    setFormCategory('');
    setSubmitError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // ── 提交新增学生 ──────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setSubmitError('姓名不能为空');
      return;
    }

    // 合并分类标签
    const allTags = [...formTags];
    if (formCategory && !allTags.includes(formCategory)) {
      allTags.unshift(formCategory);
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await createStudent({
        name: formName.trim(),
        phone: formPhone.trim() || undefined,
        age: formAge ? parseFloat(formAge) : undefined,
        tags: allTags,
        status: formStatus,
        stage: formStage,
        pauseTime: formPauseTime || undefined,
        currentTask: formCurrentTask.trim() || undefined,
      });
      handleCloseModal();
      await loadStudents(searchQuery);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '保存失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── 删除学生 ──────────────────────────────────────────────
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确认删除学生「${name}」？此操作不可撤销。`)) return;
    try {
      await deleteStudent(id);
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败');
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <LayoutGrid size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Strawberry CRM</h1>
          </div>
          <nav className="ml-8 hidden md:flex items-center gap-6">
            <a href="#" className="text-primary font-medium border-b-2 border-primary pb-1">学生管理</a>
            <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors pb-1">课程计划</a>
            <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors pb-1">数据统计</a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ring-2 ring-slate-100 dark:ring-slate-800">
            <img
              src="https://picsum.photos/seed/admin/100/100"
              alt="Admin"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </header>

      <main className="p-6 max-w-[1600px] mx-auto">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
              <Filter size={18} className="text-slate-500" />
              <span className="text-sm font-medium">筛选</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
              <span className="text-sm font-medium">种类</span>
              <ChevronDown size={16} className="text-slate-400" />
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mr-2">Database:</span>
              <span className="text-[10px] font-bold text-primary">Supabase</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索学生姓名或ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm w-64 transition-all"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2 bg-secondary text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/20 font-medium"
            >
              <Plus size={18} />
              <span>插入数据</span>
            </button>
          </div>
        </div>

        {/* Student Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-4 w-12 text-center">
                    <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary transition-all bg-transparent" />
                  </th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Key size={14} className="text-secondary" />
                      ID (UUID)
                    </div>
                  </th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">姓名</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">电话</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">年龄</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">标签</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">地位</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">暂停</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">当前任务</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">阶段</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">头像</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">创建于</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={13} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <Loader2 size={32} className="animate-spin text-primary" />
                        <span className="text-sm">正在加载学生数据...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={13} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3 text-rose-500">
                        <AlertCircle size={32} />
                        <span className="text-sm font-medium">{error}</span>
                        <button
                          onClick={() => loadStudents(searchQuery)}
                          className="text-xs text-primary hover:underline"
                        >
                          点击重试
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <UserCircle size={40} />
                        <span className="text-sm">暂无学生数据</span>
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="text-xs text-primary hover:underline"
                        >
                          点击添加第一位学生
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-primary/[0.03] dark:hover:bg-primary/[0.05] transition-colors group">
                      <td className="p-4 text-center">
                        <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary bg-transparent" />
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-400 truncate max-w-[150px]">{student.id}</td>
                      <td className="p-4 font-medium">{student.name}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">{student.phone}</td>
                      <td className="p-4">{student.age}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {student.tags.map(tag => (
                            <span key={tag} className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tag === '常规单' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                                tag === '绘本阅读' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                                  tag === '重点单' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' :
                                    tag === '高意向' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                                      'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                              }`}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-md ${student.status.startsWith('explore') ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                            student.status === 'followed' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                              'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                          }`}>
                          {student.status === 'explore_3' ? '待探索3次' :
                            student.status === 'explore_2' ? '待探索2次' :
                              student.status === 'followed' ? '已跟进' : '待上门'}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-500">{student.pauseTime}</td>
                      <td className="p-4 text-xs max-w-[200px] truncate" title={student.currentTask}>{student.currentTask}</td>
                      <td className="p-4">
                        <span className={`text-xs font-medium ${student.stage === 'opportunity' ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary'
                          }`}>
                          {student.stage === 'opportunity' ? '机会' : '带领'}
                        </span>
                      </td>
                      <td className="p-4">
                        {student.avatar ? (
                          <div className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">无效的</span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-slate-400">{student.createdAt}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDelete(student.id, student.name)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md"
                          title="删除"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              共 <span className="font-medium text-slate-700 dark:text-slate-300">{students.length}</span> 名学生
              {searchQuery && <span className="ml-1 text-primary">（搜索："{searchQuery}"）</span>}
            </span>
            <div className="flex items-center gap-2">
              <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-white dark:hover:bg-slate-800 transition-colors disabled:opacity-50" disabled>
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-md text-sm font-medium shadow-sm">1</button>
              <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-white dark:hover:bg-slate-800 transition-colors disabled:opacity-50" disabled>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        {stats && (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="进班人数"
              current={stats.classEnrollment.current}
              total={stats.classEnrollment.target}
              color="bg-blue-500"
              unit="人"
            />
            <StatCard
              title="退费X"
              current={stats.refunds.current}
              total={stats.refunds.limit}
              color="bg-rose-500"
              unit="人"
              warning={stats.refunds.current >= stats.refunds.limit - 1 ? '即将达到本月风控值' : undefined}
            />
            <StatCard
              title="招聘人数"
              current={stats.recruitment.current}
              total={stats.recruitment.target}
              color="bg-indigo-500"
              unit="人"
            />
            <StatCard
              title="现金 (元)"
              current={stats.cash.current}
              total={stats.cash.target}
              color="bg-emerald-500"
              unit=""
              isCurrency
            />
          </div>
        )}
      </main>

      {/* Floating Help Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-40">
        <HelpCircle size={24} />
      </button>

      {/* Add Student Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-cream-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">插入新学生数据</h2>
                    <p className="text-xs text-slate-500 mt-0.5">请填写以下信息以创建新的学生档案</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <form id="add-student-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 姓名 */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      姓名 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      placeholder="输入学生姓名"
                      required
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm px-4 py-2.5 transition-all outline-none"
                    />
                  </div>
                  {/* 电话 */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">电话</label>
                    <input
                      type="tel"
                      value={formPhone}
                      onChange={e => setFormPhone(e.target.value)}
                      placeholder="输入联系电话"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm px-4 py-2.5 transition-all outline-none"
                    />
                  </div>
                  {/* 年龄 */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">年龄</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="18"
                      value={formAge}
                      onChange={e => setFormAge(e.target.value)}
                      placeholder="输入学生年龄"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm px-4 py-2.5 transition-all outline-none"
                    />
                  </div>
                  {/* 类别 */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">类别</label>
                    <select
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm px-4 py-2.5 transition-all outline-none"
                    >
                      <option value="">选择学生类别</option>
                      <option value="常规单">常规单</option>
                      <option value="重点单">重点单</option>
                      <option value="高意向">高意向</option>
                    </select>
                  </div>
                  {/* 地位 */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">地位</label>
                    <select
                      value={formStatus}
                      onChange={e => setFormStatus(e.target.value as StudentStatus)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm px-4 py-2.5 transition-all outline-none"
                    >
                      <option value="explore_3">待探索3次</option>
                      <option value="explore_2">待探索2次</option>
                      <option value="followed">已跟进</option>
                      <option value="pending_visit">待上门</option>
                    </select>
                  </div>
                  {/* 阶段 */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">阶段</label>
                    <select
                      value={formStage}
                      onChange={e => setFormStage(e.target.value as StudentStage)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm px-4 py-2.5 transition-all outline-none"
                    >
                      <option value="opportunity">机会</option>
                      <option value="leading">带领</option>
                    </select>
                  </div>
                  {/* 暂停时间 */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">暂停时间</label>
                    <input
                      type="datetime-local"
                      value={formPauseTime}
                      onChange={e => setFormPauseTime(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm px-4 py-2.5 transition-all outline-none"
                    />
                  </div>
                  {/* 标签 */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      标签 <span className="text-xs font-normal text-slate-400">（输入后按 Enter 添加）</span>
                    </label>
                    <div className="w-full min-h-[42px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 flex flex-wrap gap-1.5 items-center">
                      {formTags.map(tag => (
                        <span key={tag} className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)}>
                            <X size={12} className="cursor-pointer" />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={formTagInput}
                        onChange={e => setFormTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder="添加标签..."
                        className="border-none bg-transparent focus:ring-0 text-sm p-0 ml-1 flex-1 min-w-[60px] outline-none"
                      />
                    </div>
                  </div>
                  {/* 当前任务 */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">当前任务</label>
                    <textarea
                      value={formCurrentTask}
                      onChange={e => setFormCurrentTask(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm px-4 py-2.5 transition-all outline-none"
                      placeholder="描述当前针对该学生的跟进任务..."
                      rows={3}
                    />
                  </div>

                  {/* 错误提示 */}
                  {submitError && (
                    <div className="md:col-span-2 flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-600 dark:text-rose-400 text-sm">
                      <AlertCircle size={16} className="shrink-0" />
                      {submitError}
                    </div>
                  )}
                </form>
              </div>

              <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-white dark:bg-slate-900">
                <button
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-sm disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  form="add-student-form"
                  disabled={isSubmitting}
                  className="px-8 py-2.5 bg-primary text-white rounded-lg hover:bg-rose-600 transition-all shadow-lg shadow-primary/20 font-medium text-sm flex items-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      保存中...
                    </>
                  ) : '确认保存'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, current, total, color, unit, warning, isCurrency }: {
  title: string;
  current: number;
  total: number;
  color: string;
  unit: string;
  warning?: string;
  isCurrency?: boolean;
}) {
  const percentage = Math.min(100, (current / total) * 100);
  const formattedCurrent = isCurrency ? current.toLocaleString() : current;
  const formattedTotal = isCurrency ? `目标 ${Math.floor(total / 1000)}k` : `/ ${total} ${unit}`;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</span>
        <div className={`w-2 h-2 rounded-full ${color} ${warning ? 'animate-pulse' : ''}`}></div>
      </div>
      <div className="flex items-end gap-2 mt-1">
        <span className={`text-3xl font-bold ${isCurrency ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>{formattedCurrent}</span>
        <span className="text-sm text-slate-400 mb-1">{formattedTotal}</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`${color} h-full rounded-full`}
        />
      </div>
      {warning && <p className="text-[10px] text-rose-500 font-medium mt-1">{warning}</p>}
    </div>
  );
}
