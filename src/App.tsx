import React, { useState, useEffect } from 'react';
import { Calculator, Plus, Trash2, Save, RotateCcw, BookOpen } from 'lucide-react';

interface Course {
  id: string;
  creditHours: number;
  grade: string;
  gradePoint: number;
}

interface PreviousRecord {
  cgpa: number;
  totalCreditHours: number;
}

const GRADE_SCALE = {
  'A+': 4.00,
  'A': 3.75,
  'B+': 3.50,
  'B': 3.25,
  'C+': 3.00,
  'C': 2.75,
  'D+': 2.50,
  'D': 2.25,
  'F': 0.00
};

const GRADE_OPTIONS = Object.keys(GRADE_SCALE);

function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [previousRecord, setPreviousRecord] = useState<PreviousRecord>({
    cgpa: 0,
    totalCreditHours: 0
  });
  const [showPreviousRecord, setShowPreviousRecord] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('aiub-cgpa-calculator');
    if (savedData) {
      const { courses: savedCourses, previousRecord: savedPreviousRecord } = JSON.parse(savedData);
      setCourses(savedCourses || []);
      setPreviousRecord(savedPreviousRecord || { cgpa: 0, totalCreditHours: 0 });
      setShowPreviousRecord(savedPreviousRecord?.totalCreditHours > 0);
    }
  }, []);

  const addCourse = () => {
    const newCourse: Course = {
      id: Date.now().toString(),
      creditHours: 3,
      grade: 'A+',
      gradePoint: GRADE_SCALE['A+']
    };
    setCourses([...courses, newCourse]);
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter(course => course.id !== id));
  };

  const updateCourse = (id: string, field: keyof Course, value: string | number) => {
    setCourses(courses.map(course => {
      if (course.id === id) {
        const updatedCourse = { ...course, [field]: value };
        if (field === 'grade') {
          updatedCourse.gradePoint = GRADE_SCALE[value as keyof typeof GRADE_SCALE];
        }
        return updatedCourse;
      }
      return course;
    }));
  };

  const calculateSemesterGPA = () => {
    if (courses.length === 0) return 0;
    
    const totalQualityPoints = courses.reduce((sum, course) => {
      return sum + (course.gradePoint * course.creditHours);
    }, 0);
    
    const totalCreditHours = courses.reduce((sum, course) => sum + course.creditHours, 0);
    
    return totalCreditHours > 0 ? totalQualityPoints / totalCreditHours : 0;
  };

  const calculateCumulativeGPA = () => {
    const semesterGPA = calculateSemesterGPA();
    const semesterCreditHours = courses.reduce((sum, course) => sum + course.creditHours, 0);
    
    if (!showPreviousRecord || previousRecord.totalCreditHours === 0) {
      return semesterGPA;
    }
    
    const previousQualityPoints = previousRecord.cgpa * previousRecord.totalCreditHours;
    const currentQualityPoints = semesterGPA * semesterCreditHours;
    const totalQualityPoints = previousQualityPoints + currentQualityPoints;
    const totalCreditHours = previousRecord.totalCreditHours + semesterCreditHours;
    
    return totalCreditHours > 0 ? totalQualityPoints / totalCreditHours : 0;
  };

  const saveCalculation = () => {
    const dataToSave = {
      courses,
      previousRecord: showPreviousRecord ? previousRecord : { cgpa: 0, totalCreditHours: 0 }
    };
    localStorage.setItem('aiub-cgpa-calculator', JSON.stringify(dataToSave));
    alert('Calculation saved successfully!');
  };

  const resetCalculation = () => {
    setCourses([]);
    setPreviousRecord({ cgpa: 0, totalCreditHours: 0 });
    setShowPreviousRecord(false);
    localStorage.removeItem('aiub-cgpa-calculator');
  };

  const semesterGPA = calculateSemesterGPA();
  const cumulativeGPA = calculateCumulativeGPA();
  const totalCreditHours = courses.reduce((sum, course) => sum + course.creditHours, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/American_International_University-Bangladesh_Monogram.svg.png" 
              alt="AIUB Logo" 
              className="w-12 h-12 mr-3"
            />
            <h1 className="text-4xl font-bold text-white">AIUB CGPA Calculator</h1>
          </div>
          <p className="text-blue-100 text-lg">
            American International University Bangladesh - Official Grade Point Calculator
          </p>
          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-4xl mx-auto">
            <h3 className="text-white font-semibold mb-2">AIUB Grading Scale:</h3>
            <div className="grid grid-cols-3 md:grid-cols-9 gap-2 text-sm">
              {Object.entries(GRADE_SCALE).map(([grade, point]) => (
                <div key={grade} className="text-center">
                  <span className="text-white font-medium">{grade}</span>
                  <span className="text-blue-100 block">{point.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Input Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
                  Course Grades
                </h2>
                <button
                  onClick={addCourse}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Course
                </button>
              </div>

              {/* Previous Record Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="previousRecord"
                    checked={showPreviousRecord}
                    onChange={(e) => setShowPreviousRecord(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="previousRecord" className="font-medium text-gray-700">
                    Include Previous Academic Record
                  </label>
                </div>
                {showPreviousRecord && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Previous CGPA
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="4"
                        step="0.01"
                        value={previousRecord.cgpa || ''}
                        onChange={(e) => setPreviousRecord({
                          ...previousRecord,
                          cgpa: parseFloat(e.target.value) || 0
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Previous Total Credit Hours
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={previousRecord.totalCreditHours || ''}
                        onChange={(e) => setPreviousRecord({
                          ...previousRecord,
                          totalCreditHours: parseInt(e.target.value) || 0
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Courses */}
              <div className="space-y-4">
                {courses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No courses added yet. Click "Add Course" to get started!</p>
                  </div>
                ) : (
                  courses.map((course, index) => (
                    <div key={course.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-800">Course {index + 1}</h3>
                        <button
                          onClick={() => removeCourse(course.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Credit Hours
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="4"
                            value={course.creditHours}
                            onChange={(e) => updateCourse(course.id, 'creditHours', parseInt(e.target.value) || 3)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Grade
                          </label>
                          <select
                            value={course.grade}
                            onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {GRADE_OPTIONS.map(grade => (
                              <option key={grade} value={grade}>
                                {grade} ({GRADE_SCALE[grade as keyof typeof GRADE_SCALE].toFixed(2)})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-gray-600">
                        Grade Points: <span className="font-medium">
                          {(course.gradePoint * course.creditHours).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-6">
                <button
                  onClick={saveCalculation}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Calculation
                </button>
                <button
                  onClick={resetCalculation}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg flex items-center transition-colors"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset All
                </button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-xl p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Calculator className="w-6 h-6 mr-2 text-green-600" />
                Results
              </h2>

              <div className="space-y-6">
                {/* Current Semester */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-3">Current Semester</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Credit Hours:</span>
                      <span className="font-medium">{totalCreditHours}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Semester GPA:</span>
                      <span className="font-bold text-blue-600 text-lg">
                        {semesterGPA.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cumulative */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-3">Cumulative</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Credit Hours:</span>
                      <span className="font-medium">
                        {showPreviousRecord 
                          ? previousRecord.totalCreditHours + totalCreditHours 
                          : totalCreditHours}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cumulative GPA:</span>
                      <span className="font-bold text-green-600 text-xl">
                        {cumulativeGPA.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* GPA Interpretation */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Grade Interpretation</h3>
                  <div className="text-sm space-y-1">
                    {cumulativeGPA >= 3.75 && (
                      <p className="text-green-600 font-medium">Excellent Performance! 🎉</p>
                    )}
                    {cumulativeGPA >= 3.50 && cumulativeGPA < 3.75 && (
                      <p className="text-blue-600 font-medium">Very Good Performance! 👍</p>
                    )}
                    {cumulativeGPA >= 3.00 && cumulativeGPA < 3.50 && (
                      <p className="text-yellow-600 font-medium">Good Performance! 📚</p>
                    )}
                    {cumulativeGPA >= 2.50 && cumulativeGPA < 3.00 && (
                      <p className="text-orange-600 font-medium">Satisfactory Performance</p>
                    )}
                    {cumulativeGPA < 2.50 && cumulativeGPA > 0 && (
                      <p className="text-red-600 font-medium">Need Improvement</p>
                    )}
                    {courses.length === 0 && (
                      <p className="text-gray-500">Add courses to see results</p>
                    )}
                  </div>
                </div>

                {/* Instructions */}
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">Instructions</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Add all your courses for this semester</li>
                    <li>• Select the correct grade for each course</li>
                    <li>• Include previous CGPA for cumulative calculation</li>
                    <li>• Save your calculation for future reference</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Owner Information */}
      <div className="mt-12 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="text-white">
              <p className="text-lg font-semibold mb-2">Made By: Jumael Hossain Abeer</p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-blue-100">
                <span className="flex items-center">
                  <span className="font-medium">Department:</span>
                  <span className="ml-2">CoE</span>
                </span>
                <span className="hidden sm:block">•</span>
                <span className="flex items-center">
                  <span className="font-medium">ID:</span>
                  <span className="ml-2">25-61555-1</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;