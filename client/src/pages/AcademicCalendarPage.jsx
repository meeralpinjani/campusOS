import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  Edit,
  Save,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getActiveAcademicCalendar,
  getAllAcademicCalendars,
  getAcademicCalendarById,
  updateAcademicCalendar,
  createAcademicCalendar,
  activateAcademicCalendar,
} from '../services/api';

const CATEGORY_COLORS = {
  academic: 'bg-[#FFD700] dark:bg-amber-500 text-slate-950 font-bold',
  'student-activity': 'bg-[#6B8E23] dark:bg-lime-600 text-white font-bold',
  holiday: 'bg-[#4682B4] dark:bg-sky-600 text-white font-bold',
  examination: 'bg-[#FF1493] dark:bg-pink-600 text-white font-bold',
  off: 'bg-[#1E293B] dark:bg-slate-950 text-white font-bold',
  none: 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold',
};

export const AcademicCalendarPage = () => {
  const { user } = useAuth();
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allCalendars, setAllCalendars] = useState([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState('');

  const isStaff = user && ['admin', 'moderator'].includes(user.role);

  const fetchCalendarData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getActiveAcademicCalendar();
      setCalendar(res.calendar);

      if (isStaff) {
        const allRes = await getAllAcademicCalendars();
        setAllCalendars(allRes.calendars || []);
        if (res.calendar?._id) {
          setSelectedCalendarId(res.calendar._id);
        }
      }
    } catch (err) {
      console.error('Error loading academic calendar:', err);
      setError('Failed to load academic calendar');
    } finally {
      setLoading(false);
    }
  }, [isStaff]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  const handleSelectCalendarChange = async (e) => {
    const id = e.target.value;
    setSelectedCalendarId(id);
    try {
      setLoading(true);
      const res = await getAcademicCalendarById(id);
      setCalendar(res.calendar);
    } catch (err) {
      console.error('Error switching calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActivate = async () => {
    if (!calendar || !calendar._id) return;
    try {
      setSaving(true);
      const res = await activateAcademicCalendar(calendar._id);
      setCalendar(res.calendar);
      alert('Calendar marked as live active version!');
      fetchCalendarData();
    } catch (err) {
      alert(err.message || 'Failed to set active calendar');
    } finally {
      setSaving(false);
    }
  };

  const handleDayCategoryChange = (monthIdx, weekIdx, dayKey, newCategory) => {
    if (!calendar || !isEditing) return;
    const updatedMonths = [...calendar.months];
    updatedMonths[monthIdx].weeks[weekIdx].days[dayKey].category = newCategory;
    setCalendar({ ...calendar, months: updatedMonths });
  };

  const handleEventsTextChange = (monthIdx, weekIdx, newText) => {
    if (!calendar || !isEditing) return;
    const updatedMonths = [...calendar.months];
    updatedMonths[monthIdx].weeks[weekIdx].eventsText = newText;
    setCalendar({ ...calendar, months: updatedMonths });
  };

  const handleInstructionDaysChange = (monthIdx, val) => {
    if (!calendar || !isEditing) return;
    const updatedMonths = [...calendar.months];
    updatedMonths[monthIdx].instructionDaysThisMonth = parseInt(val) || 0;
    
    const total = updatedMonths.reduce((sum, m) => sum + (m.instructionDaysThisMonth || 0), 0);
    setCalendar({
      ...calendar,
      months: updatedMonths,
      summary: { ...calendar.summary, totalInstructionDays: total },
    });
  };

  const handleSaveCalendar = async () => {
    if (!calendar || !calendar._id) return;
    try {
      setSaving(true);
      const res = await updateAcademicCalendar(calendar._id, calendar);
      setCalendar(res.calendar);
      setIsEditing(false);
      alert('Academic calendar updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to save calendar updates');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicateNew = async () => {
    if (!calendar) return;
    const newTitle = prompt('Enter title for new calendar semester template:', 'EVEN SEMESTER, 2026-27');
    if (!newTitle) return;

    try {
      setSaving(true);
      const newCalData = {
        ...calendar,
        _id: undefined,
        title: calendar.title,
        semesterLabel: newTitle,
        isActive: false,
      };
      await createAcademicCalendar(newCalData);
      alert('New calendar created from template!');
      fetchCalendarData();
    } catch (err) {
      alert(err.message || 'Failed to create calendar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400 text-xs font-semibold">
        Loading official institutional academic calendar...
      </div>
    );
  }

  if (error || !calendar) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          No Academic Calendar Found
        </h3>
        <p className="text-xs text-slate-500">
          {error || 'An academic calendar document has not been published yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white dark:bg-[#1A1B1E] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAFAFA] dark:bg-[#111214] text-[#111111] dark:text-[#F5F5F5] border border-[#E5E5E5] dark:border-[#2A2A2C] flex items-center justify-center shadow-2xs">
            <CalendarIcon className="w-5 h-5 text-[#C43E3E]" />
          </div>
          <div>
            <h2 className="font-extrabold text-[#111111] dark:text-[#F5F5F5] text-base leading-tight">
              Official Institutional Academic Calendar
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>{calendar.semesterLabel}</span>
              {calendar.isActive && (
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                  LIVE ACTIVE CALENDAR
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Staff Management Controls */}
        {isStaff && (
          <div className="flex flex-wrap items-center gap-2">
            {allCalendars.length > 1 && (
              <select
                value={selectedCalendarId}
                onChange={handleSelectCalendarChange}
                className="px-3 py-1.5 bg-[#FAFAFA] dark:bg-[#111214] border border-[#E5E5E5] dark:border-[#2A2A2C] rounded-xl text-xs font-bold text-[#111111] dark:text-[#F5F5F5] focus:outline-none"
              >
                {allCalendars.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.semesterLabel} {c.isActive ? '(Active)' : ''}
                  </option>
                ))}
              </select>
            )}

            {!calendar.isActive && (
              <button
                onClick={handleToggleActivate}
                disabled={saving}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
              >
                Set Active
              </button>
            )}

            <button
              onClick={handleDuplicateNew}
              disabled={saving}
              className="px-3 py-1.5 bg-[#FAFAFA] dark:bg-[#111214] hover:bg-[#E5E5E5]/50 text-[#111111] dark:text-[#F5F5F5] font-bold text-xs rounded-xl border border-[#E5E5E5] dark:border-[#2A2A2C] transition-all cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Duplicate Template</span>
            </button>

            {isEditing ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveCalendar}
                  disabled={saving}
                  className="px-4 py-1.5 bg-[#C43E3E] hover:bg-[#A63333] text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-[#FAFAFA] dark:hover:bg-[#111214] rounded-xl"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-1.5 bg-[#C43E3E] hover:bg-[#A63333] text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Calendar</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Printed Grid Table Target Sheet Container (Supports Light Mode & Dark Mode) */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 overflow-x-auto select-none font-sans transition-colors">
        {/* Header Block: Logo & Title */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-slate-900 dark:border-slate-700 pb-4">
          <div className="flex items-center gap-4">
            <img
              src="/kit_official_logo.png"
              alt="KIT Official Logo"
              className="h-16 object-contain"
            />
          </div>

          <div className="text-right sm:text-right text-center space-y-1">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-950 dark:text-slate-100 border-b-2 border-slate-900 dark:border-slate-700 pb-0.5 inline-block">
              ACADEMIC CALENDAR
            </h2>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-300">
              {isEditing ? (
                <input
                  type="text"
                  value={calendar.title}
                  onChange={(e) => setCalendar({ ...calendar, title: e.target.value })}
                  className="px-2 py-0.5 border rounded text-xs font-bold bg-slate-50 dark:bg-slate-800"
                />
              ) : (
                calendar.title
              )}
            </p>
            <p className="text-xs font-black text-blue-950 dark:text-blue-400 uppercase">
              {isEditing ? (
                <input
                  type="text"
                  value={calendar.semesterLabel}
                  onChange={(e) => setCalendar({ ...calendar, semesterLabel: e.target.value })}
                  className="px-2 py-0.5 border rounded text-xs font-bold bg-slate-50 dark:bg-slate-800"
                />
              ) : (
                calendar.semesterLabel
              )}
            </p>
          </div>
        </div>

        {/* Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-900 dark:border-slate-700 text-xs font-semibold">
            <thead>
              <tr className="bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-center font-bold">
                <th className="border border-slate-900 dark:border-slate-700 px-2 py-2 w-12">Week No.</th>
                <th className="border border-slate-900 dark:border-slate-700 px-3 py-2 w-24">Month</th>
                <th className="border border-slate-900 dark:border-slate-700 px-1 py-1 w-10">Mon</th>
                <th className="border border-slate-900 dark:border-slate-700 px-1 py-1 w-10">Tue</th>
                <th className="border border-slate-900 dark:border-slate-700 px-1 py-1 w-10">Wed</th>
                <th className="border border-slate-900 dark:border-slate-700 px-1 py-1 w-10">Thu</th>
                <th className="border border-slate-900 dark:border-slate-700 px-1 py-1 w-10">Fri</th>
                <th className="border border-slate-900 dark:border-slate-700 px-1 py-1 w-10">Sat</th>
                <th className="border border-slate-900 dark:border-slate-700 px-1 py-1 w-10">Sun</th>
                <th className="border border-slate-900 dark:border-slate-700 px-3 py-2 text-left">Events</th>
              </tr>
            </thead>
            <tbody>
              {calendar.months?.map((month, mIdx) => (
                <React.Fragment key={month.monthLabel || mIdx}>
                  {month.weeks?.map((week, wIdx) => {
                    const isFirstWeekOfMonth = wIdx === 0;

                    return (
                      <tr key={wIdx} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                        {/* Week No. */}
                        <td className="border border-slate-900 dark:border-slate-700 text-center py-1.5 font-bold">
                          {week.weekNumber}
                        </td>

                        {/* Month Label (Merged across week rows) */}
                        {isFirstWeekOfMonth && (
                          <td
                            rowSpan={month.weeks.length}
                            className="border border-slate-900 dark:border-slate-700 text-center font-black bg-slate-100 dark:bg-slate-800 align-middle px-2 py-1 uppercase tracking-wider"
                          >
                            {month.monthLabel}
                          </td>
                        )}

                        {/* Mon..Sun Day Cells */}
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayKey) => {
                          const dayObj = week.days?.[dayKey] || { date: null, category: 'none' };
                          const catClass = CATEGORY_COLORS[dayObj.category] || CATEGORY_COLORS.none;

                          return (
                            <td
                              key={dayKey}
                              className={`border border-slate-900 dark:border-slate-700 text-center p-1 font-bold ${catClass} relative`}
                            >
                              {isEditing && dayObj.date !== null ? (
                                <select
                                  value={dayObj.category}
                                  onChange={(e) =>
                                    handleDayCategoryChange(mIdx, wIdx, dayKey, e.target.value)
                                  }
                                  className="w-full text-[9px] font-bold p-0.5 border rounded bg-white text-slate-900"
                                >
                                  <option value="none">{dayObj.date}</option>
                                  <option value="academic">Academic (Yellow)</option>
                                  <option value="student-activity">Activity (Olive)</option>
                                  <option value="holiday">Holiday (Blue)</option>
                                  <option value="examination">Exam (Pink)</option>
                                </select>
                              ) : (
                                dayObj.date || ''
                              )}
                            </td>
                          );
                        })}

                        {/* Events Text Column */}
                        <td className="border border-slate-900 dark:border-slate-700 px-3 py-1.5 text-left text-slate-900 dark:text-slate-100 font-medium">
                          {isEditing ? (
                            <input
                              type="text"
                              value={week.eventsText || ''}
                              onChange={(e) => handleEventsTextChange(mIdx, wIdx, e.target.value)}
                              className="w-full px-2 py-0.5 border rounded text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                            />
                          ) : (
                            week.eventsText || ''
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Subtotal Row per Month */}
                  <tr className="bg-slate-200/90 dark:bg-slate-800 font-black text-center border-b-2 border-slate-900 dark:border-slate-700">
                    <td colSpan={10} className="border border-slate-900 dark:border-slate-700 py-1.5 text-center text-xs tracking-wider font-extrabold">
                      Instruction Days: {isEditing ? (
                        <input
                          type="number"
                          value={month.instructionDaysThisMonth || 0}
                          onChange={(e) => handleInstructionDaysChange(mIdx, e.target.value)}
                          className="w-16 px-2 py-0.5 border rounded text-xs font-black text-center bg-slate-50 dark:bg-slate-700"
                        />
                      ) : (
                        month.instructionDaysThisMonth
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Instruction Days Banner */}
        <div className="p-2.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-900 dark:border-slate-700 text-slate-950 dark:text-slate-100 font-black text-xs uppercase tracking-wider text-center">
          TOTAL INSTRUCTION DAYS (INCLUDING EXAMINATION): {calendar.summary?.totalInstructionDays || 111} DAYS
        </div>

        {/* Notes Block */}
        {calendar.summary?.notes && calendar.summary.notes.length > 0 && (
          <div className="border border-slate-900 dark:border-slate-700 p-3.5 space-y-1 bg-slate-50 dark:bg-slate-800/50 text-xs rounded-lg">
            <span className="font-extrabold text-slate-950 dark:text-slate-100">Note:</span>
            {calendar.summary.notes.map((note, idx) => (
              <p key={idx} className="text-slate-800 dark:text-slate-300 font-medium pl-2">
                {idx + 1}. {note}
              </p>
            ))}
          </div>
        )}

        {/* 4-Category Color Legend Table (1:1 Exact Replica of Image 2) */}
        <div className="border border-slate-900 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
          {/* Category Titles Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 text-center font-black">
            <div className="p-2 border-r border-b border-slate-900 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
              Academic Activities
            </div>
            <div className="p-2 border-r border-b border-slate-900 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
              Student Activities
            </div>
            <div className="p-2 border-r border-b border-slate-900 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
              Holidays/ Public Holidays
            </div>
            <div className="p-2 border-b border-slate-900 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
              Examination
            </div>
          </div>

          {/* Color Bars Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 h-4">
            <div className="bg-[#FFD700] dark:bg-amber-400 border-r border-b border-slate-900 dark:border-slate-700" />
            <div className="bg-[#6B8E23] dark:bg-lime-600 border-r border-b border-slate-900 dark:border-slate-700" />
            <div className="bg-[#4682B4] dark:bg-sky-500 border-r border-b border-slate-900 dark:border-slate-700" />
            <div className="bg-[#FF1493] dark:bg-pink-500 border-b border-slate-900 dark:border-slate-700" />
          </div>

          {/* Description Labels Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 text-center font-bold text-[11px]">
            <div className="p-2 border-r border-b border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
              Commencement of Academics
            </div>
            <div className="p-2 border-r border-b border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
              End of Academic Activities<br />(Including Remedial Classes)
            </div>
            <div className="p-2 border-r border-b border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
              Mid Semester Examination
            </div>
            <div className="p-2 border-b border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
              End Semester Examination<br />(Theory + Lab)
            </div>
          </div>

          {/* Date Ranges Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 text-center font-semibold text-[11px] bg-slate-50 dark:bg-slate-800">
            <div className="p-2 border-r border-slate-900 dark:border-slate-700 text-slate-900 dark:text-slate-200">
              14th July, 2026
            </div>
            <div className="p-2 border-r border-slate-900 dark:border-slate-700 text-slate-900 dark:text-slate-200">
              05th November, 2026
            </div>
            <div className="p-2 border-r border-slate-900 dark:border-slate-700 text-slate-900 dark:text-slate-200">
              22nd to 29th September, 2026
            </div>
            <div className="p-2 text-slate-900 dark:text-slate-200">
              12th November to 17th December, 2026
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
