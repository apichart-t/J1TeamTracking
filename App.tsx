import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  CalendarDays,
  Coins,
  ChevronRight,
  FileText,
  Users,
  ArrowLeft,
  RefreshCw,
  PlusCircle,
  Save,
  X,
  FilePlus,
  BarChart2,
  Building2,
  UserCog,
  Lock,
  User,
  PieChart as PieChartIcon,
  Layers,
  LogOut,
  TrendingUp
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';

// ==========================================
// 🔧 CONFIGURATION (ตั้งค่า URL ใหม่ตามที่ให้มา)
// ==========================================
const API_URLS = {
  PROJECTS: "https://script.google.com/macros/s/AKfycbxn8E5-tuvCo-Irm37m1plJUenFWmPMQTN9-_5MKvZHplGiSsUxVeK6UyA1o4kp6q_TKQ/exec",
  DEPARTMENTS: "https://script.google.com/macros/s/AKfycbx8qlRilK6iuD0PhyUdB8RmyJzjGzgBfYvBjuLCig5KZ0xTF4_1WGccz62A7ontTysGoA/exec",
  USERS: "https://script.google.com/macros/s/AKfycbz9pkuBEOZLkQKDRni8WpRHGuEqplQnbAkCXuuviLZ4hhgynSBPS4mrKnl0TqUdUyYz/exec",
  LOGS: "https://script.google.com/macros/s/AKfycbyJAs6y7CUhy_4esOCIZnwhZEZSJfHCniszRp3Z_vBeSg5SGVKq8lyB4uDPfGc1eVhbsg/exec",
  GROUPS: "https://script.google.com/macros/s/AKfycbzHZx9V3wy-Lwgx6-k16sINWdICA24rxBfXPNj3UhBMWre3KB1pAssX2GotclAHSZ94/exec"
};

// ==========================================
// 📋 INTERFACES (แก้ไขให้ตรงกับ CSV)
// ==========================================

interface Department {
  dept_id: string;
  dept_name: string;
  head_name: string;
  status?: string;
}

interface Group {
  group_id: string;
  group_name: string;
  dept_id: string;
  status?: string;
}

interface Project {
  project_id: string | number;
  project_name: string;
  project_status: string; // แก้จาก status เป็น project_status ตาม CSV
  start_date: string;
  end_date?: string;
  budget: number;
  group_id: string;
  dept_id: string;
}

interface Log {
  log_id?: number | string;
  created_at: string;
  project_id: string | number;
  group_id?: string;
  period_start: string;
  period_end: string;
  progress_percent: number;
  past_performance: string;
  next_steps: string;
  issues_risks: string;
  remark: string;
  reporter_id: string;
}

interface UserData {
  user_id: string;
  username: string; // แก้จาก user_name เป็น username ตาม CSV
  password?: string; 
  full_name: string;
  dept_id: string;
  role: string;
  status: string;
}

interface CurrentUser {
  user_id: string;
  full_name: string;
  role: 'Admin' | 'User' | 'Viewer';
  dept_id: string;
}

// ---- Form Interfaces ----

interface NewProjectFormData {
  project_id: string;
  project_name: string;
  group_id: string;
  dept_id: string;
  start_date: string;
  end_date: string;
  budget: number;
  project_status: string; // แก้ให้ตรงกับ CSV
}

interface ProgressLogFormData {
  log_id: string;
  created_at: string;
  project_id: string;
  group_id: string;
  period_start: string;
  period_end: string;
  progress_percent: number;
  past_performance: string;
  next_steps: string;
  issues_risks: string;
  remark: string;
  reporter_id: string;
}

interface DepartmentFormData {
  dept_id: string;
  dept_name: string;
  head_name: string;
  status: string;
}

interface GroupFormData {
  group_id: string;
  group_name: string;
  dept_id: string;
  status: string;
}

interface UserFormData {
  user_id: string;
  username: string; // แก้ให้ตรงกับ CSV
  password: string;
  full_name: string;
  dept_id: string;
  role: 'Admin' | 'User' | 'Viewer';
  status: 'Active' | 'Inactive';
}

// ==========================================
// 🧩 SUB-COMPONENTS
// ==========================================

// --- Project Timeline View (New Feature) ---
const ProjectTimeline: React.FC<{ 
  project: Project; 
  logs: Log[]; 
  onClose: () => void 
}> = ({ project, logs, onClose }) => {
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{project.project_name}</h3>
            <span className="text-sm text-slate-500">ประวัติการรายงานผล (History Log)</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {sortedLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <FileText size={40} className="mb-2 opacity-50"/>
              <p>ยังไม่มีการรายงานความคืบหน้า</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pb-4">
              {sortedLogs.map((log, idx) => (
                <div key={log.log_id || idx} className="relative pl-8">
                  <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${idx === 0 ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500 bg-white px-2 py-1 rounded border">
                      {new Date(log.created_at).toLocaleDateString('th-TH')}
                    </span>
                    {idx === 0 && <span className="text-[10px] bg-blue-100 text-blue-600 px-2 rounded-full">ล่าสุด</span>}
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-slate-700 flex items-center gap-2">
                        <TrendingUp size={16} className="text-blue-500"/> ความคืบหน้า: {log.progress_percent}%
                      </span>
                    </div>
                    <div className="space-y-3 text-sm text-slate-600">
                      <div>
                        <strong className="text-slate-900 block text-xs uppercase text-emerald-600 mb-1">ผลงานที่ทำได้:</strong>
                        <p className="bg-slate-50 p-2 rounded">{log.past_performance}</p>
                      </div>
                      {log.issues_risks && log.issues_risks !== '-' && (
                        <div>
                          <strong className="text-red-700 block text-xs uppercase flex items-center gap-1 mb-1">
                            <AlertCircle size={12}/> ปัญหา/อุปสรรค:
                          </strong>
                          <p className="bg-red-50 p-2 rounded text-red-600 border border-red-100">{log.issues_risks}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Dashboard Charts ---
const DashboardCharts: React.FC<{ projects: Project[]; logs: Log[] }> = ({ projects, logs }) => {
  const progressData = useMemo(() => {
    return projects.map(project => {
      // Find latest log
      const projectLogs = logs.filter(l => String(l.project_id) === String(project.project_id));
      const latestLog = projectLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      
      return {
        name: project.project_name,
        progress: latestLog && latestLog.progress_percent !== undefined ? Number(latestLog.progress_percent) : 0,
        status: project.project_status // Use updated key
      };
    }).sort((a, b) => b.progress - a.progress).slice(0, 8);
  }, [projects, logs]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => {
      const status = p.project_status || 'Unknown'; // Use updated key
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  }, [projects]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Bar Chart */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
          <BarChart2 size={18} className="text-blue-400" /> 
          ความคืบหน้าโครงการล่าสุด (Top Progress)
        </h3>
        <div className="h-64 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={progressData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fill: '#94a3b8' }} 
                width={100}
                tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                cursor={{fill: '#1e293b'}}
              />
              <Bar dataKey="progress" radius={[0, 4, 4, 0]} barSize={20}>
                {progressData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.progress >= 100 ? '#10b981' : entry.progress > 50 ? '#3b82f6' : '#f59e0b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
          <PieChartIcon size={18} className="text-indigo-400" />
          สถานะโครงการภาพรวม (Overall Status)
        </h3>
        <div className="h-64 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#0f172a" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// --- Forms ---

const CreateProjectForm: React.FC<{ 
  onSubmit: (data: NewProjectFormData) => void; 
  isSubmitting: boolean;
  departments: Department[];
  groups: Group[];
}> = ({ onSubmit, isSubmitting, departments, groups }) => {
  // Use timestamp for simpler ID generation
  const generateID = () => 'P-' + Date.now().toString().slice(-6);

  const [formData, setFormData] = useState<NewProjectFormData>({
    project_id: generateID(),
    project_name: '',
    group_id: '',
    dept_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    budget: 0,
    project_status: 'ยังไม่เริ่ม' // Updated key
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-6 lg:p-10 rounded-2xl shadow-sm border border-slate-200 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <PlusCircle className="text-blue-600" /> สร้างแผนงานใหม่ (Create Project)
          </h2>
        </div>
        <div className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">ID: {formData.project_id}</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">ชื่อแผนงาน/โครงการ <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="project_name"
            required
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.project_name}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">กลุ่มงาน (Work Group)</label>
            <select
              name="group_id"
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.group_id}
              onChange={handleChange}
            >
              <option value="">-- เลือกกลุ่มงาน --</option>
              {groups.map(g => (
                <option key={g.group_id} value={g.group_id}>{g.group_name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">หน่วยงานเจ้าของ</label>
            <select
              name="dept_id"
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.dept_id}
              onChange={handleChange}
            >
              <option value="">-- เลือกหน่วยงาน --</option>
              {departments.map(d => (
                <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">วันที่เริ่ม</label>
            <input
              type="date"
              name="start_date"
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.start_date}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">วันที่สิ้นสุด</label>
            <input
              type="date"
              name="end_date"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.end_date}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">งบประมาณ (บาท)</label>
            <div className="relative">
              <input
                type="number"
                name="budget"
                min="0"
                className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.budget}
                onChange={handleChange}
              />
              <Coins className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">สถานะ</label>
            <select
              name="project_status" // Updated key
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.project_status}
              onChange={handleChange}
            >
              <option value="ยังไม่เริ่ม">ยังไม่เริ่ม</option>
              <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
              <option value="เสร็จสิ้น">เสร็จสิ้น</option>
              <option value="ยกเลิก">ยกเลิก</option>
            </select>
          </div>
        </div>

        <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2 ${isSubmitting ? 'opacity-70' : ''}`}
          >
            {isSubmitting ? <RefreshCw className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />} บันทึก
          </button>
        </div>
      </form>
    </div>
  );
};

const CreateProgressLogForm: React.FC<{ 
  projects: Project[];
  groups: Group[];
  departments: Department[];
  onSubmit: (data: ProgressLogFormData) => void; 
  isSubmitting: boolean;
  currentUser: CurrentUser;
}> = ({ projects, groups, departments, onSubmit, isSubmitting, currentUser }) => {
  const generateID = () => 'L-' + Date.now().toString().slice(-6);

  const [formData, setFormData] = useState<ProgressLogFormData>({
    log_id: generateID(),
    created_at: new Date().toISOString(),
    project_id: '',
    group_id: '',
    period_start: '',
    period_end: '',
    progress_percent: 0,
    past_performance: '',
    next_steps: '',
    issues_risks: '',
    remark: '',
    reporter_id: currentUser.user_id
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'project_id') {
      const selectedProj = projects.find(p => String(p.project_id) === String(value));
      setFormData(prev => ({ 
        ...prev, 
        project_id: value,
        group_id: selectedProj ? selectedProj.group_id : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      created_at: new Date().toISOString()
    });
  };

  const selectedProject = projects.find(p => String(p.project_id) === String(formData.project_id));
  const selectedGroup = selectedProject ? groups.find(g => String(g.group_id) === String(selectedProject.group_id)) : null;
  const selectedDept = selectedProject ? departments.find(d => String(d.dept_id) === String(selectedProject.dept_id)) : null;

  return (
    <div className="bg-white p-6 lg:p-10 rounded-2xl shadow-sm border border-slate-200 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FilePlus className="text-emerald-600" /> รายงานผลการดำเนินการ
          </h2>
        </div>
        <div className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">ID: {formData.log_id}</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
           <div className="md:col-span-6 space-y-1">
              <label className="block text-sm font-medium text-slate-700">เลือกโครงการ <span className="text-red-500">*</span></label>
              <select
                name="project_id"
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.project_id}
                onChange={handleChange}
              >
                <option value="">-- กรุณาเลือกโครงการ --</option>
                {projects.map(p => (
                  <option key={p.project_id} value={p.project_id}>
                    {p.project_name} ({p.project_status})
                  </option>
                ))}
              </select>
              {selectedProject && (
                <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 grid grid-cols-2 gap-4">
                  <div>
                    <span className="block font-semibold text-slate-400 uppercase text-[10px]">กลุ่มงาน</span>
                    <span>{selectedGroup?.group_name || '-'}</span>
                  </div>
                  <div>
                      <span className="block font-semibold text-slate-400 uppercase text-[10px]">หน่วยงาน</span>
                      <span>{selectedDept?.dept_name || '-'}</span>
                  </div>
                </div>
              )}
           </div>
           <div className="md:col-span-3 space-y-1">
              <label className="block text-sm font-medium text-slate-700">ห้วงเวลา (เริ่ม)</label>
              <input
                type="date"
                name="period_start"
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.period_start}
                onChange={handleChange}
              />
           </div>
           <div className="md:col-span-3 space-y-1">
              <label className="block text-sm font-medium text-slate-700">ห้วงเวลา (สิ้นสุด)</label>
              <input
                type="date"
                name="period_end"
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.period_end}
                onChange={handleChange}
              />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
           <div className="md:col-span-3 space-y-1">
              <label className="block text-sm font-medium text-slate-700">ความคืบหน้า (%)</label>
              <div className="relative">
                <input
                  type="number"
                  name="progress_percent"
                  min="0"
                  max="100"
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.progress_percent}
                  onChange={handleChange}
                />
              </div>
           </div>
           <div className="md:col-span-3 space-y-1">
              <label className="block text-sm font-medium text-slate-700">ผู้รายงาน</label>
              <input
                type="text"
                readOnly
                className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-500"
                value={currentUser.full_name}
              />
           </div>
           <div className="md:col-span-6 space-y-1">
              <label className="block text-sm font-medium text-slate-700">หมายเหตุ</label>
              <input
                type="text"
                name="remark"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.remark}
                onChange={handleChange}
              />
           </div>
        </div>

        <div className="space-y-6 pt-4">
            <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-800 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500"/> ผลการดำเนินการที่ผ่านมา <span className="text-red-500">*</span>
                </label>
                <textarea
                    name="past_performance"
                    required
                    className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-y"
                    value={formData.past_performance}
                    onChange={handleChange}
                />
            </div>

            <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-800 flex items-center gap-2">
                    <TrendingUp size={16} className="text-blue-500"/> แผนที่จะดำเนินการต่อไป <span className="text-red-500">*</span>
                </label>
                <textarea
                    name="next_steps"
                    required
                    className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-y"
                    value={formData.next_steps}
                    onChange={handleChange}
                />
            </div>

            <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-800 flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-500"/> ปัญหาและอุปสรรค
                </label>
                <textarea
                    name="issues_risks"
                    className="w-full h-24 p-4 bg-red-50/50 border border-red-100 rounded-lg focus:ring-2 focus:ring-red-500/50 outline-none resize-y"
                    value={formData.issues_risks}
                    onChange={handleChange}
                />
            </div>
        </div>

        <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-2 ${isSubmitting ? 'opacity-70' : ''}`}
          >
            {isSubmitting ? <RefreshCw className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />} บันทึกรายงาน
          </button>
        </div>
      </form>
    </div>
  );
};

const CreateDepartmentForm: React.FC<{ onSubmit: (data: DepartmentFormData) => void; isSubmitting: boolean }> = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState<DepartmentFormData>({
    dept_id: 'D' + Math.floor(10 + Math.random() * 90),
    dept_name: '',
    head_name: '',
    status: 'Active'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-6 lg:p-10 rounded-2xl shadow-sm border border-slate-200 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="text-purple-600" /> สร้างหน่วยงาน (New Department)
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">รหัสหน่วยงาน (Dept ID)</label>
            <input type="text" name="dept_id" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={formData.dept_id} onChange={handleChange} />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">ชื่อหน่วยงาน (Dept Name)</label>
            <input type="text" name="dept_name" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={formData.dept_name} onChange={handleChange} />
          </div>
        </div>
        <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">หัวหน้าหน่วยงาน</label>
            <input type="text" name="head_name" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={formData.head_name} onChange={handleChange} />
        </div>
        <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
          <button type="submit" disabled={isSubmitting} className={`px-8 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center gap-2 ${isSubmitting ? 'opacity-70' : ''}`}>
            {isSubmitting ? <RefreshCw className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />} บันทึก
          </button>
        </div>
      </form>
    </div>
  );
};

const CreateGroupForm: React.FC<{ 
  departments: Department[]; 
  onSubmit: (data: GroupFormData) => void; 
  isSubmitting: boolean 
}> = ({ departments, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState<GroupFormData>({
    group_id: 'G' + Math.floor(100 + Math.random() * 900),
    group_name: '',
    dept_id: '',
    status: 'Active'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-6 lg:p-10 rounded-2xl shadow-sm border border-slate-200 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Layers className="text-pink-600" /> สร้างกลุ่มงาน (New Group)
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">รหัสกลุ่มงาน (Group ID)</label>
            <input type="text" name="group_id" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" value={formData.group_id} onChange={handleChange} />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">หน่วยงานต้นสังกัด</label>
            <select name="dept_id" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" value={formData.dept_id} onChange={handleChange}>
              <option value="">-- เลือกหน่วยงาน --</option>
              {departments.map(d => (<option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>))}
            </select>
          </div>
        </div>
        <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">ชื่อกลุ่มงาน</label>
            <input type="text" name="group_name" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" value={formData.group_name} onChange={handleChange} />
        </div>
        <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
          <button type="submit" disabled={isSubmitting} className={`px-8 py-2.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-medium flex items-center gap-2 ${isSubmitting ? 'opacity-70' : ''}`}>
            {isSubmitting ? <RefreshCw className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />} บันทึก
          </button>
        </div>
      </form>
    </div>
  );
};

const CreateUserForm: React.FC<{ 
  departments: Department[]; 
  onSubmit: (data: UserFormData) => void; 
  isSubmitting: boolean 
}> = ({ departments, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState<UserFormData>({
    user_id: 'U' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
    username: '', // Updated key
    password: '',
    full_name: '',
    dept_id: '',
    role: 'User',
    status: 'Active'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-6 lg:p-10 rounded-2xl shadow-sm border border-slate-200 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <UserCog className="text-orange-500" /> จัดการผู้ใช้ (User Management)
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">ชื่อผู้ใช้ (Username)</label>
              <div className="relative">
                <input type="text" name="username" required className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="username" value={formData.username} onChange={handleChange} />
                <User className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
              </div>
           </div>
           <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">รหัสผ่าน</label>
              <div className="relative">
                <input type="password" name="password" required className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="••••••••" value={formData.password} onChange={handleChange} />
                <Lock className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
              </div>
           </div>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">ชื่อ-นามสกุล</label>
          <input type="text" name="full_name" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" value={formData.full_name} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">หน่วยงาน</label>
            <select name="dept_id" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" value={formData.dept_id} onChange={handleChange}>
              <option value="">-- เลือกหน่วยงาน --</option>
              {departments.map(d => (<option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">สิทธิ์การใช้งาน</label>
            <select name="role" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" value={formData.role} onChange={handleChange}>
              <option value="User">User</option>
              <option value="Admin">Admin</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">สถานะ</label>
            <select name="status" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" value={formData.status} onChange={handleChange}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
          <button type="submit" disabled={isSubmitting} className={`px-8 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium flex items-center gap-2 ${isSubmitting ? 'opacity-70' : ''}`}>
            {isSubmitting ? <RefreshCw className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />} บันทึก
          </button>
        </div>
      </form>
    </div>
  );
};

// ==========================================
// 🚀 MAIN APP COMPONENT
// ==========================================
const App: React.FC = () => {
  // ---- State ----
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create_project' | 'create_progress_log' | 'departments' | 'groups' | 'users'>('dashboard'); 
  
  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    user_id: 'A-001',
    full_name: 'Admin User',
    role: 'Admin',
    dept_id: 'ALL'
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedProjectId, setSelectedProjectId] = useState<string | number | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---- Filtering Data based on Role ----
  const visibleProjects = useMemo(() => {
    if (currentUser.role === 'Admin' || currentUser.role === 'Viewer') {
        return projects;
    }
    return projects.filter(p => p.dept_id === currentUser.dept_id); 
  }, [projects, currentUser]);

  const visibleLogs = useMemo(() => {
     const visibleProjectIds = new Set(visibleProjects.map(p => String(p.project_id)));
     return logs.filter(l => visibleProjectIds.has(String(l.project_id)));
  }, [logs, visibleProjects]);

  // ---- Fetch Data ----
  const fetchData = async () => {
    setLoading(true);
    try {
      const [projRes, deptRes, userRes, logRes, groupRes] = await Promise.all([
        fetch(API_URLS.PROJECTS),
        fetch(API_URLS.DEPARTMENTS),
        fetch(API_URLS.USERS),
        fetch(API_URLS.LOGS),
        fetch(API_URLS.GROUPS)
      ]);
      
      const safeJson = async (res: Response, fallback: any = []) => {
         if (!res.ok) return fallback;
         try {
            const json = await res.json();
            if (Array.isArray(json)) return json;
            if (json.data && Array.isArray(json.data)) return json.data;
            return fallback;
         } catch (e) {
            console.error("JSON Parse Error", e);
            return fallback;
         }
      };

      const projectsData = await safeJson(projRes);
      const departmentsData = await safeJson(deptRes);
      const usersData = await safeJson(userRes);
      const logsData = await safeJson(logRes);
      const groupsData = await safeJson(groupRes);

      setProjects(projectsData);
      setDepartments(departmentsData);
      setUsers(usersData);
      setLogs(logsData);
      setGroups(groupsData);
      
    } catch (err: any) {
        console.error("Fetch error:", err);
        setError(typeof err === 'string' ? err : (err.message || "An unknown error occurred"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
     fetchData();
  }, []);

  useEffect(() => {
      if (!selectedProjectId && visibleProjects.length > 0) {
          setSelectedProjectId(visibleProjects[0].project_id);
      } else if (selectedProjectId && !visibleProjects.find(p => String(p.project_id) === String(selectedProjectId))) {
          setSelectedProjectId(visibleProjects.length > 0 ? visibleProjects[0].project_id : null);
      }
  }, [visibleProjects, selectedProjectId]);


  // ---- Role Switcher ----
  const handleRoleSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const role = e.target.value as any;
      
      let newUserData: CurrentUser = {
          user_id: 'A-001',
          full_name: 'Admin User',
          role: 'Admin',
          dept_id: 'ALL'
      };

      if (role === 'User') {
          const demoDept = departments.length > 0 ? departments[0].dept_id : 'D01';
          newUserData = {
              user_id: 'U-005',
              full_name: 'Regular User',
              role: 'User',
              dept_id: demoDept 
          };
      } else if (role === 'Viewer') {
          newUserData = {
              user_id: 'V-001',
              full_name: 'Viewer User',
              role: 'Viewer',
              dept_id: 'ALL'
          };
      }

      setCurrentUser(newUserData);
      if (
          (role === 'User' && ['create_project', 'departments', 'groups', 'users'].includes(activeTab)) ||
          (role === 'Viewer' && activeTab !== 'dashboard')
      ) {
          setActiveTab('dashboard');
      }
  };

  // ---- Generic POST Helper ----
  const postData = async (url: string, data: any) => {
    // Send as POST request. Since these are simple Web Apps, often they are set up to handle POST
    // and parse body. `no-cors` mode might be needed if not set up perfectly, but usually standard POST works
    // if GAS is set to 'Anyone'.
    // Important: Google Apps Script Web App POST often requires stringified body.
    await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  };

  // ---- Create Handlers ----
  const handleCreateProject = async (formData: NewProjectFormData) => {
    setIsSubmitting(true);
    try {
      await postData(API_URLS.PROJECTS, formData);
      alert("บันทึกข้อมูลเรียบร้อยแล้ว");
      await fetchData();
      setActiveTab('dashboard');
    } catch (err) {
      console.error("Create Project Error:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProgressLog = async (formData: ProgressLogFormData) => {
    setIsSubmitting(true);
    try {
      await postData(API_URLS.LOGS, formData);
      alert("บันทึกรายงานผลเรียบร้อยแล้ว");
      await fetchData(); // Refresh to see update
      setActiveTab('dashboard');
    } catch (err) {
      console.error("Create Progress Log Error:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateDepartment = async (formData: DepartmentFormData) => {
    setIsSubmitting(true);
    try {
      await postData(API_URLS.DEPARTMENTS, formData);
      alert("สร้างหน่วยงานเรียบร้อยแล้ว");
      await fetchData(); 
    } catch (err) {
      console.error("Create Dept Error:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateGroup = async (formData: GroupFormData) => {
    setIsSubmitting(true);
    try {
      await postData(API_URLS.GROUPS, formData);
      alert("สร้างกลุ่มงานเรียบร้อยแล้ว");
      await fetchData(); 
    } catch (err) {
      console.error("Create Group Error:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateUser = async (formData: UserFormData) => {
    setIsSubmitting(true);
    try {
      await postData(API_URLS.USERS, formData);
      alert("สร้างผู้ใช้เรียบร้อยแล้ว");
      await fetchData();
    } catch (err) {
      console.error("Create User Error:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- Helper Styles ----
  const getStatusStyle = (status: any) => {
    const s = (typeof status === 'string') ? status.toLowerCase() : '';
    if (s.includes('active') || s.includes('กำลังดำเนินการ') || s === 'in progress') return { text: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-500/30', icon: <Activity size={16} /> };
    if (s.includes('pending') || s.includes('ยังไม่เริ่ม') || s === 'not started') return { text: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-500/30', icon: <Clock size={16} /> };
    if (s.includes('completed') || s.includes('เสร็จสิ้น')) return { text: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-500/30', icon: <CheckCircle2 size={16} /> };
    if (s.includes('cancel') || s.includes('ยกเลิก')) return { text: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-500/30', icon: <X size={16} /> };
    return { text: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30', icon: <Activity size={16} /> };
  };

  const selectedProjectData = visibleProjects?.find(p => String(p.project_id) === String(selectedProjectId));
  const selectedProjectLogs = (visibleLogs || [])
    .filter(l => String(l.project_id) === String(selectedProjectId))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  const totalProjects = visibleProjects?.length || 0;
  const activeProjects = (visibleProjects || []).filter(p => {
      const s = String(p.project_status).toLowerCase(); // Updated key
      return s.includes('active') || s.includes('กำลังดำเนินการ');
  }).length;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* === SIDEBAR === */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 transition-all duration-300">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
           <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-900/20">
             <LayoutDashboard size={22} className="text-white"/>
           </div>
           <span className="text-xl font-bold text-white tracking-tight">ProjTrack</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
           <button 
             onClick={() => setActiveTab('dashboard')}
             className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group
               ${activeTab === 'dashboard' 
                 ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' 
                 : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
           >
             <FolderKanban size={20} />
             <span className="font-medium">Projects</span>
           </button>

           {currentUser.role === 'Admin' && (
             <button 
               onClick={() => setActiveTab('create_project')}
               className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group
                 ${activeTab === 'create_project' 
                   ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' 
                   : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
             >
               <PlusCircle size={20} />
               <span className="font-medium">Create Plan</span>
             </button>
           )}

           {['Admin', 'User'].includes(currentUser.role) && (
             <button 
               onClick={() => setActiveTab('create_progress_log')}
               className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group
                 ${activeTab === 'create_progress_log' 
                   ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' 
                   : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
             >
               <FilePlus size={20} />
               <span className="font-medium">Progress Update</span>
             </button>
           )}

           {currentUser.role === 'Admin' && (
             <>
                <div className="my-2 border-t border-slate-800 mx-4"></div>
                <div className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Management</div>

                <button 
                  onClick={() => setActiveTab('departments')}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group
                    ${activeTab === 'departments' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                >
                  <Building2 size={20} />
                  <span className="font-medium">Departments</span>
                </button>

                <button 
                  onClick={() => setActiveTab('groups')}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group
                    ${activeTab === 'groups' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                >
                  <Layers size={20} />
                  <span className="font-medium">Work Groups</span>
                </button>

                <button 
                  onClick={() => setActiveTab('users')}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group
                    ${activeTab === 'users' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                >
                  <UserCog size={20} />
                  <span className="font-medium">User Mgmt</span>
                </button>
             </>
           )}
           
           <div className="mt-auto px-4 pb-4">
             <button
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-400 hover:bg-slate-800 hover:text-red-300 transition-all duration-200"
                onClick={() => alert("Logout feature coming soon!")}
             >
                <LogOut size={20} />
                <span className="font-medium">Sign Out</span>
             </button>
           </div>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-slate-800/50">
           <div className="mb-4">
              <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Simulate Role:</label>
              <select 
                value={currentUser.role} 
                onChange={handleRoleSwitch}
                className="w-full bg-slate-800 text-slate-300 text-xs rounded border border-slate-700 p-1 focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="Admin">Admin (Full Access)</option>
                <option value="User">User (Dept Restricted)</option>
                <option value="Viewer">Viewer (Read Only)</option>
              </select>
           </div>
           <div className="flex items-center gap-3 px-4 py-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white
                ${currentUser.role === 'Admin' ? 'bg-indigo-500' : currentUser.role === 'User' ? 'bg-emerald-500' : 'bg-orange-500'}
              `}>
                {currentUser.role.substring(0,2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{currentUser.full_name}</p>
                  <p className="text-xs text-slate-500 truncate">{currentUser.role} | {currentUser.dept_id}</p>
              </div>
           </div>
        </div>
      </aside>

      {/* === MAIN CONTENT === */}
      <main className={`flex-1 overflow-y-auto relative ${activeTab !== 'dashboard' ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-200'}`}>
        
        {loading && (!projects || !projects.length) && activeTab === 'dashboard' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-50">
                <Activity className="animate-spin text-blue-500 mb-4" size={40} />
                <p className="text-slate-400 animate-pulse">Loading data from Google Sheets...</p>
            </div>
        ) : error && activeTab === 'dashboard' ? (
            <div className="flex items-center justify-center h-full text-red-400 gap-2 p-6 text-center">
                <AlertCircle /> Error loading data: {error}
            </div>
        ) : (
            <>
            {/* ---------------- VIEW 1: DASHBOARD ---------------- */}
            {activeTab === 'dashboard' && (
                <div className="p-6 lg:p-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <header className="mb-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
                                <p className="text-slate-400">
                                    {currentUser.role === 'User' 
                                      ? `ภาพรวมโครงการเฉพาะหน่วยงานของคุณ (${currentUser.dept_id})` 
                                      : 'ภาพรวมโครงการและความคืบหน้าทั้งหมด'}
                                </p>
                            </div>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
                            <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400"><FolderKanban size={28}/></div>
                            <div><p className="text-slate-400 text-sm font-medium">Total Projects</p><p className="text-3xl font-bold text-white mt-1">{totalProjects}</p></div>
                        </div>
                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
                            <div className="p-4 rounded-2xl bg-green-500/10 text-green-400"><Activity size={28}/></div>
                            <div><p className="text-slate-400 text-sm font-medium">Active Status</p><p className="text-3xl font-bold text-white mt-1">{activeProjects}</p></div>
                        </div>
                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
                            <div className="p-4 rounded-2xl bg-orange-500/10 text-orange-400"><Coins size={28}/></div>
                            <div><p className="text-slate-400 text-sm font-medium">Total Budget</p><p className="text-3xl font-bold text-white mt-1">
                                {(visibleProjects.reduce((acc, p) => acc + (Number(p.budget) || 0), 0)).toLocaleString()}
                            </p></div>
                        </div>
                    </div>

                    <DashboardCharts projects={visibleProjects} logs={visibleLogs} />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-4 flex flex-col gap-4">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2"><FolderKanban size={18}/> Projects List</h2>
                            </div>
                            {visibleProjects.length === 0 ? (
                                <div className="p-8 text-center border border-slate-800 rounded-xl bg-slate-900 text-slate-500 text-sm">No projects found.</div>
                            ) : (
                                <div className="space-y-3">
                                {(visibleProjects || []).map(proj => {
                                    const statusStyle = getStatusStyle(proj.project_status);
                                    const isSelected = String(proj.project_id) === String(selectedProjectId);
                                    return (
                                    <button
                                        key={proj.project_id}
                                        onClick={() => setSelectedProjectId(proj.project_id)}
                                        className={`text-left w-full p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden
                                        ${isSelected ? 'bg-slate-800 border-blue-500/50 ring-1 ring-blue-500/20' : 'bg-slate-900 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'}
                                        `}
                                    >
                                        {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                                        <div className="flex justify-between items-start mb-2 pl-2">
                                        <h3 className={`font-semibold ${isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                                            {String(proj.project_name)}
                                        </h3>
                                        </div>
                                        <div className="flex items-center gap-2 pl-2">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                                                {statusStyle.icon} {String(proj.project_status)}
                                            </span>
                                            <span className="text-xs text-slate-500 ml-auto flex items-center gap-1">
                                                <CalendarDays size={12}/> {new Date(proj.start_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short'})}
                                            </span>
                                        </div>
                                    </button>
                                    );
                                })}
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-8">
                            {selectedProjectData ? (
                                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 lg:p-8 h-full min-h-[500px]">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-800">
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-1">{String(selectedProjectData.project_name)}</h2>
                                            <p className="text-slate-400 text-sm flex items-center gap-2">Project ID: <span className="font-mono text-slate-300">#{String(selectedProjectData.project_id)}</span></p>
                                        </div>
                                        <div className={`mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusStyle(selectedProjectData.project_status).bg} ${getStatusStyle(selectedProjectData.project_status).text} ${getStatusStyle(selectedProjectData.project_status).border}`}>
                                            {getStatusStyle(selectedProjectData.project_status).icon}
                                            <span className="font-semibold uppercase tracking-wider text-xs">{String(selectedProjectData.project_status)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <Activity size={18} className="text-blue-400" /> Recent Activity
                                        </h3>
                                        <button 
                                          onClick={() => setShowTimeline(true)}
                                          className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                                        >
                                          ดูประวัติทั้งหมด (Full History) <ChevronRight size={14}/>
                                        </button>
                                    </div>

                                    <div className="relative space-y-8 pl-6 before:absolute before:inset-0 before:left-2 before:w-0.5 before:bg-slate-800">
                                        {selectedProjectLogs.length === 0 ? (
                                            <div className="text-center py-10 text-slate-500 bg-slate-950/30 rounded-xl border border-slate-800/50 border-dashed">
                                                <p>No activity logs yet.</p>
                                            </div>
                                        ) : (
                                        selectedProjectLogs.slice(0, 3).map((log, index) => ( // Show only top 3
                                            <div key={index} className="relative group">
                                                <div className="absolute -left-[23px] mt-1.5 w-3 h-3 rounded-full bg-slate-800 border-2 border-slate-600 group-hover:border-blue-500 group-hover:bg-blue-500 transition-all z-10 shadow-sm"></div>
                                                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/60 hover:border-slate-700 transition-colors">
                                                    <div className="flex justify-between items-start">
                                                        <p className="text-slate-200 mb-2 leading-relaxed">{String(log.past_performance)}</p>
                                                        {log.progress_percent !== undefined && (
                                                            <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">{log.progress_percent}%</span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
                                                    <Clock size={12} /> {new Date(log.created_at).toLocaleString('th-TH')}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                        )}
                                    </div>
                                    
                                    {['Admin', 'User'].includes(currentUser.role) && (
                                        <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
                                            <button 
                                                onClick={() => {
                                                  // Pre-select this project in form
                                                  setActiveTab('create_progress_log');
                                                }}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                            >
                                                รายงานผลโครงการนี้
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 h-full flex flex-col items-center justify-center text-slate-400 text-center border-dashed">
                                    <FolderKanban size={48} className="text-slate-600 mb-4 opacity-50"/>
                                    <p>Select a project to view details</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

             {/* ---------------- VIEW 3: CREATE PROJECT ---------------- */}
             {activeTab === 'create_project' && currentUser.role === 'Admin' && (
                <div className="p-6 lg:p-10 min-h-full">
                    <button 
                        onClick={() => setActiveTab('dashboard')} 
                        className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
                    >
                        <ArrowLeft size={18}/> Back to Dashboard
                    </button>

                    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CreateProjectForm 
                          onSubmit={handleCreateProject} 
                          isSubmitting={isSubmitting} 
                          departments={departments}
                          groups={groups}
                        />
                    </div>
                </div>
             )}

             {/* ---------------- VIEW 4: CREATE PROGRESS LOG ---------------- */}
             {activeTab === 'create_progress_log' && ['Admin', 'User'].includes(currentUser.role) && (
                <div className="p-6 lg:p-10 min-h-full">
                    <button 
                        onClick={() => setActiveTab('dashboard')} 
                        className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
                    >
                        <ArrowLeft size={18}/> Back to Dashboard
                    </button>

                    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CreateProgressLogForm 
                            projects={visibleProjects || []}
                            groups={groups}
                            departments={departments}
                            onSubmit={handleCreateProgressLog} 
                            isSubmitting={isSubmitting} 
                            currentUser={currentUser}
                        />
                    </div>
                </div>
             )}

             {/* ---------------- VIEW 5: DEPARTMENTS ---------------- */}
             {activeTab === 'departments' && currentUser.role === 'Admin' && (
                <div className="p-6 lg:p-10 min-h-full">
                    <button 
                        onClick={() => setActiveTab('dashboard')} 
                        className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
                    >
                        <ArrowLeft size={18}/> Back to Dashboard
                    </button>

                    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CreateDepartmentForm 
                            onSubmit={handleCreateDepartment}
                            isSubmitting={isSubmitting}
                        />
                        {departments.length > 0 && (
                            <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-800 mb-4">Existing Departments</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                            <tr>
                                                <th className="px-4 py-3 rounded-l-lg">ID</th>
                                                <th className="px-4 py-3">Name</th>
                                                <th className="px-4 py-3 rounded-r-lg">Head</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {departments.map((dept, idx) => (
                                                <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                                    <td className="px-4 py-3 font-mono text-slate-600">{dept.dept_id}</td>
                                                    <td className="px-4 py-3 font-medium text-slate-800">{dept.dept_name}</td>
                                                    <td className="px-4 py-3 text-slate-600">{dept.head_name}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
             )}

             {/* ---------------- VIEW 6: GROUPS ---------------- */}
             {activeTab === 'groups' && currentUser.role === 'Admin' && (
                <div className="p-6 lg:p-10 min-h-full">
                    <button 
                        onClick={() => setActiveTab('dashboard')} 
                        className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
                    >
                        <ArrowLeft size={18}/> Back to Dashboard
                    </button>

                    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CreateGroupForm 
                            departments={departments}
                            onSubmit={handleCreateGroup}
                            isSubmitting={isSubmitting}
                        />
                        {groups.length > 0 && (
                            <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-800 mb-4">Existing Work Groups</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                            <tr>
                                                <th className="px-4 py-3 rounded-l-lg">Group ID</th>
                                                <th className="px-4 py-3">Group Name</th>
                                                <th className="px-4 py-3 rounded-r-lg">Dept Ref</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {groups.map((g, idx) => (
                                                <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                                    <td className="px-4 py-3 font-mono text-slate-600">{g.group_id}</td>
                                                    <td className="px-4 py-3 font-medium text-slate-800">{g.group_name}</td>
                                                    <td className="px-4 py-3 text-slate-600">{g.dept_id}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
             )}

             {/* ---------------- VIEW 7: USERS ---------------- */}
             {activeTab === 'users' && currentUser.role === 'Admin' && (
                <div className="p-6 lg:p-10 min-h-full">
                    <button 
                        onClick={() => setActiveTab('dashboard')} 
                        className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
                    >
                        <ArrowLeft size={18}/> Back to Dashboard
                    </button>

                    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CreateUserForm 
                            departments={departments || []}
                            onSubmit={handleCreateUser}
                            isSubmitting={isSubmitting}
                        />
                         {users.length > 0 && (
                            <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-800 mb-4">Registered Users</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                            <tr>
                                                <th className="px-4 py-3 rounded-l-lg">User ID</th>
                                                <th className="px-4 py-3">Username</th>
                                                <th className="px-4 py-3">Name</th>
                                                <th className="px-4 py-3">Role</th>
                                                <th className="px-4 py-3 rounded-r-lg">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((u, idx) => (
                                                <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                                    <td className="px-4 py-3 font-mono text-slate-600">{u.user_id}</td>
                                                    <td className="px-4 py-3 text-slate-800 font-medium">{u.username}</td>
                                                    <td className="px-4 py-3 text-slate-600">{u.full_name}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                            u.role === 'Admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                                                        }`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                            u.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                            {u.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
             )}

            </>
        )}

        {/* Timeline Modal */}
        {showTimeline && selectedProjectData && (
          <ProjectTimeline 
            project={selectedProjectData}
            logs={selectedProjectLogs}
            onClose={() => setShowTimeline(false)}
          />
        )}

      </main>
    </div>
  );
};

export default App;