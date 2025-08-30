// Student Academic Management System JavaScript

// Data Storage
let students = JSON.parse(localStorage.getItem('students')) || [];
let attendance = JSON.parse(localStorage.getItem('attendance')) || {};
let grades = JSON.parse(localStorage.getItem('grades')) || [];
let academicRecords = JSON.parse(localStorage.getItem('academicRecords')) || [];
let totalSchoolDays = parseInt(localStorage.getItem('totalSchoolDays')) || 200;
let startDate = localStorage.getItem('startDate') || '2025-08-28';
let teachers = JSON.parse(localStorage.getItem('teachers')) || [];
let currentTeacher = JSON.parse(localStorage.getItem('currentTeacher')) || null;

// Add default teacher if no teachers exist
if (teachers.length === 0) {
    teachers = [
        {
            id: '1',
            username: 'admin',
            password: 'admin123',
            subject: 'ICT',
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            username: 'teacher',
            password: 'teacher123',
            subject: 'Mathematics',
            createdAt: new Date().toISOString()
        }
    ];
    localStorage.setItem('teachers', JSON.stringify(teachers));
}

// Data and utility functions
function saveData() {
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('attendance', JSON.stringify(attendance));
    localStorage.setItem('grades', JSON.stringify(grades));
    localStorage.setItem('academicRecords', JSON.stringify(academicRecords));
    localStorage.setItem('teachers', JSON.stringify(teachers));
    showSaveIndicator();
}

function showSaveIndicator() {
    // Create or update save indicator
    let indicator = document.getElementById('saveIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'saveIndicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        indicator.innerHTML = '<i class="fas fa-check"></i> Auto-saved';
        document.body.appendChild(indicator);
    }
    
    // Show the indicator
    indicator.style.opacity = '1';
    
    // Hide after 2 seconds
    setTimeout(() => {
        indicator.style.opacity = '0';
    }, 2000);
}

// Add sample students only if no students exist at all
if (students.length === 0) {
    console.log('No students found, adding sample students for testing...');
    students = [
        {
            id: '1',
            name: 'John Smith',
            studentId: 'STU001',
            class: 'Grade 10A',
            contact: '+1-234-567-8900',
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            name: 'Sarah Johnson',
            studentId: 'STU002',
            class: 'Grade 10B',
            contact: '+1-234-567-8901',
            createdAt: new Date().toISOString()
        },
        {
            id: '3',
            name: 'Mike Wilson',
            studentId: 'STU003',
            class: 'Grade 10A',
            contact: '+1-234-567-8902',
            createdAt: new Date().toISOString()
        },
        {
            id: '4',
            name: 'Emma Davis',
            studentId: 'STU004',
            class: 'Grade 11A',
            contact: '+1-234-567-8903',
            createdAt: new Date().toISOString()
        },
        {
            id: '5',
            name: 'David Brown',
            studentId: 'STU005',
            class: 'Grade 10B',
            contact: '+1-234-567-8904',
            createdAt: new Date().toISOString()
        }
    ];
    saveData();
} else {
    console.log('Found existing students:', students.length);
    console.log('Student classes in existing data:', students.map(s => s.class));
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing application...');
    checkAuthentication();
    setupAuthForms();
    initializeTabs();
    initializeDateInput();
    initializeStartDate();
    
    // Debug: Log students data before rendering
    console.log('Students loaded from localStorage:', students);
    console.log('Number of students:', students.length);
    if (students.length > 0) {
        console.log('Available classes in data:', [...new Set(students.map(s => s.class))]);
    }
    
    renderStudents();
    populateClassOptions(); // Initialize class filter for students
    renderAttendance();
    renderGrades();
    renderAcademicRecords();
    renderReports();
    setupForms();
    
    // Initialize editable tables
    setTimeout(() => {
        initializeEditableTables();
        console.log('Editable tables initialized');
    }, 200);
});

// Tab Management
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Refresh content based on active tab
            if (targetTab === 'attendance') renderAttendance();
            if (targetTab === 'grades') renderGrades();
            if (targetTab === 'students') {
                renderStudents();
                populateClassOptions();
            }
            if (targetTab === 'academic') {
                renderAcademicRecords();
                populateStudentSelects();
                populateSubjectOptions();
            }
            if (targetTab === 'reports') {
                renderReports();
                populateClassOptions();
                populateSubjectOptions();
            }
        });
    });
}

// Initialize date input with today's date
function initializeDateInput() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attendanceDate').value = today;
}

// Initialize start date
function initializeStartDate() {
    document.getElementById('startDate').value = startDate;
    document.getElementById('totalSchoolDays').value = totalSchoolDays;
}

// Update attendance calculations when start date or total days changes
function updateAttendanceCalculations() {
    startDate = document.getElementById('startDate').value;
    totalSchoolDays = parseInt(document.getElementById('totalSchoolDays').value) || 200;
    localStorage.setItem('startDate', startDate);
    localStorage.setItem('totalSchoolDays', totalSchoolDays);
    renderStudents();
    renderReports();
}

// Calculate available days (school days held from start date)
function calculateAvailableDays() {
    // Available days = Total school days - Days already held
    const daysHeld = calculateDaysHeld();
    const remainingDays = totalSchoolDays - daysHeld;
    console.log('Available Days Calculation:', {
        totalSchoolDays: totalSchoolDays,
        daysHeld: daysHeld,
        remainingDays: remainingDays
    });
    return Math.max(0, remainingDays); // Ensure non-negative
}

// Calculate days held (number of days school was conducted)
function calculateDaysHeld() {
    // Count unique dates where attendance was marked
    const attendanceDates = Object.keys(attendance).filter(date => {
        // Only count dates that have actual attendance data
        return attendance[date] && attendance[date].students && 
               Object.keys(attendance[date].students).length > 0;
    });
    
    console.log('Days Held Calculation:', {
        attendanceDatesWithData: attendanceDates,
        totalDaysHeld: attendanceDates.length,
        allAttendanceDates: Object.keys(attendance)
    });
    
    return attendanceDates.length;
}

// Authentication System
function checkAuthentication() {
    if (currentTeacher) {
        showMainApp();
    } else {
        showLoginScreen();
    }
}

function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
}

function showMainApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    if (currentTeacher) {
        document.getElementById('teacherName').textContent = currentTeacher.username;
        document.getElementById('teacherSubject').textContent = currentTeacher.subject;
    }
    
    // Populate dropdowns after showing main app
    setTimeout(() => {
        populateStudentSelects();
        populateClassOptions();
        populateSubjectOptions();
        renderReports();
    }, 100);
}

// Function to programmatically show a tab
function showTab(tabName) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Remove active class from all tabs and contents
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Add active class to target tab and corresponding content
    const targetButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (targetButton) {
        targetButton.classList.add('active');
        document.getElementById(tabName).classList.add('active');
        
        // Refresh content based on active tab
        if (tabName === 'attendance') renderAttendance();
        if (tabName === 'grades') renderGrades();
        if (tabName === 'academic') {
            renderAcademicRecords();
            populateStudentSelects();
        }
        if (tabName === 'reports') renderReports();
    }
}

function showLoginTab(tab) {
    // Remove active class from all tab buttons
    document.querySelectorAll('.login-tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Remove active class from all forms
    document.querySelectorAll('.login-form').forEach(form => form.classList.remove('active'));
    
    // Add active class to the clicked tab button
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    // Show the corresponding form
    document.getElementById(tab + 'Form').classList.add('active');
    
    // Clear any existing messages
    const existingMessage = document.querySelector('.success-message, .error-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Clear form inputs when switching tabs
    if (tab === 'login') {
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
    } else if (tab === 'signup') {
        document.getElementById('signupUsername').value = '';
        document.getElementById('signupPassword').value = '';
        document.getElementById('signupSubject').value = '';
    }
}

function setupAuthForms() {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        console.error('Login form not found!');
        return;
    }
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Login form submitted');
        
        const submitBtn = this.querySelector('button[type="submit"]');
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        console.log('Login attempt:', { username, password, teachersCount: teachers.length });
        
        // Add loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        // Simulate network delay for better UX
        setTimeout(() => {
            const teacher = teachers.find(t => t.username === username && t.password === password);
            console.log('Teacher found:', teacher);
            
            if (teacher) {
                currentTeacher = teacher;
                localStorage.setItem('currentTeacher', JSON.stringify(currentTeacher));
                showSuccessMessage('Login successful! Welcome back.');
                setTimeout(() => showMainApp(), 1000);
            } else {
                showErrorMessage('Invalid username or password. Please try again.');
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
        }, 800);
    });
    
    // Sign Up Form
    const signupForm = document.getElementById('signupForm');
    if (!signupForm) {
        console.error('Signup form not found!');
        return;
    }
    
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const submitBtn = this.querySelector('button[type="submit"]');
        const username = document.getElementById('signupUsername').value;
        const password = document.getElementById('signupPassword').value;
        const subject = document.getElementById('signupSubject').value;
        
        // Add loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        // Simulate network delay for better UX
        setTimeout(() => {
            // Check if username already exists
            if (teachers.find(t => t.username === username)) {
                showErrorMessage('Username already exists. Please choose a different one.');
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                return;
            }
            
            // Create new teacher
            const newTeacher = {
                id: Date.now().toString(),
                username,
                password,
                subject,
                createdAt: new Date().toISOString()
            };
            
            teachers.push(newTeacher);
            localStorage.setItem('teachers', JSON.stringify(teachers));
            populateSubjectOptions(); // Update subject options when new teacher is added
            
            showSuccessMessage('Account created successfully! Please login to continue.');
            setTimeout(() => {
                // Reset form and switch to login tab
                document.getElementById('signupForm').reset();
                showLoginTab('login');
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }, 1500);
        }, 1000);
    });
}

function showSuccessMessage(message) {
    const existingMessage = document.querySelector('.success-message, .error-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    
    const loginContainer = document.querySelector('.login-container');
    const loginTabs = document.querySelector('.login-tabs');
    loginContainer.insertBefore(messageDiv, loginTabs);
    
    setTimeout(() => {
        if (messageDiv && messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

function showErrorMessage(message) {
    const existingMessage = document.querySelector('.success-message, .error-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'error-message';
    messageDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    const loginContainer = document.querySelector('.login-container');
    const loginTabs = document.querySelector('.login-tabs');
    loginContainer.insertBefore(messageDiv, loginTabs);
    
    setTimeout(() => {
        if (messageDiv && messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

function logout() {
    currentTeacher = null;
    localStorage.removeItem('currentTeacher');
    showLoginScreen();
}

// Legacy loadStudentData function - replaced by loadSampleData()
// This function is commented out to prevent duplicate attendance records
/*
function loadStudentData() {
    if (students.length === 0) {
        students = [
            { id: '1', name: 'M.A. Vihangi Prarthana', studentId: '001', class: '12A', contact: '+94-71-234-5601' },
            { id: '2', name: 'M. Tharushi Sansala', studentId: '002', class: '12A', contact: '+94-71-234-5602' },
            { id: '3', name: 'W. Dinithi Bhagya', studentId: '003', class: '12A', contact: '+94-71-234-5603' },
            { id: '4', name: 'C.D.A.M. Dinuki Chamalka', studentId: '004', class: '12A', contact: '+94-71-234-5604' },
            { id: '5', name: 'M. Dinuka Nimesh', studentId: '005', class: '12A', contact: '+94-71-234-5605' },
            { id: '6', name: 'S. Suraj', studentId: '006', class: '12A', contact: '+94-71-234-5606' },
            { id: '7', name: 'B.M. Nawindu Kaweshana', studentId: '007', class: '12A', contact: '+94-71-234-5607' },
            { id: '8', name: 'M.P. Sasadara Anuhas', studentId: '008', class: '12A', contact: '+94-71-234-5608' },
            { id: '9', name: 'R. Supuni Dilushika', studentId: '009', class: '12D', contact: '+94-71-234-5609' },
            { id: '10', name: 'L.A.D. Tharushi Nimsara', studentId: '010', class: '12D', contact: '+94-71-234-5610' },
            { id: '11', name: 'W.A. Nethmi Methsara', studentId: '011', class: '12D', contact: '+94-71-234-5611' },
            { id: '12', name: 'W.A. Sawbhagya', studentId: '012', class: '12D', contact: '+94-71-234-5612' }
        ];
        
        // Initialize attendance for 2025-08-28 (all present for demo)
        attendance['2025-08-28'] = {
            date: '2025-08-28',
            students: {}
        };
        students.forEach(student => {
            attendance['2025-08-28'].students[student.id] = 'present';
        });
        
        saveData();
    }
}
*/

// Student Management Functions
function openAddStudentModal() {
    document.getElementById('addStudentModal').classList.add('show');
}

function closeModal(modalId) {
    console.log('Closing modal:', modalId);
    try {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
            console.log('Modal closed successfully');
        } else {
            console.error('Modal not found for closing:', modalId);
        }
    } catch (error) {
        console.error('Error closing modal:', error);
    }
}

function setupForms() {
    // Add Student Form
    document.getElementById('addStudentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const student = {
            id: Date.now().toString(),
            name: formData.get('studentName'),
            studentId: formData.get('studentId'),
            class: formData.get('studentClass'),
            contact: formData.get('studentContact'),
            createdAt: new Date().toISOString()
        };
        
        // Check if student ID already exists
        if (students.find(s => s.studentId === student.studentId)) {
            alert('Student ID already exists!');
            return;
        }
        
        students.push(student);
        saveData();
        renderStudents();
        populateStudentSelects();
        closeModal('addStudentModal');
        e.target.reset();
    });

    // Edit Student Form
    document.getElementById('editStudentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const studentId = formData.get('editStudentHiddenId');
        const updatedStudent = {
            name: formData.get('editStudentName'),
            studentId: formData.get('editStudentId'),
            class: formData.get('editStudentClass'),
            contact: formData.get('editStudentContact')
        };
        
        // Check if student ID already exists (excluding current student)
        const existingStudent = students.find(s => s.studentId === updatedStudent.studentId && s.id !== studentId);
        if (existingStudent) {
            alert('Student ID already exists!');
            return;
        }
        
        // Find and update the student
        const studentIndex = students.findIndex(s => s.id === studentId);
        if (studentIndex !== -1) {
            students[studentIndex] = { ...students[studentIndex], ...updatedStudent };
            saveData();
            renderStudents();
            populateStudentSelects();
            closeModal('editStudentModal');
            e.target.reset();
        }
    });

    // Add Academic Record Form
    const academicRecordForm = document.getElementById('addAcademicRecordForm');
    if (academicRecordForm) {
        academicRecordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('=== FORM SUBMISSION START ===');
            console.log('Academic record form submitted');
            
            const formData = new FormData(e.target);
            console.log('Form data entries:', Object.fromEntries(formData));
            
            try {
                const result = addAcademicRecord(formData);
                console.log('addAcademicRecord result:', result);
                
                if (result) {
                    console.log('Form submission successful, closing modal...');
                    closeModal('addAcademicRecordModal');
                    e.target.reset();
                    
                    // Reset form state
                    const assignmentGroup = document.getElementById('assignmentNumberGroup');
                    const marksHelper = document.getElementById('marksHelper');
                    const recordMarks = document.getElementById('recordMarks');
                    
                    if (assignmentGroup) assignmentGroup.style.display = 'none';
                    if (marksHelper) marksHelper.textContent = 'Select type first to see max marks';
                    if (recordMarks) recordMarks.removeAttribute('max');
                    
                    // Stay on academic records tab
                    showTab('academic');
                    renderReports();
                    populateSubjectOptions();
                    populateClassOptions();
                    
                    alert('Academic record added successfully!');
                    console.log('=== FORM SUBMISSION SUCCESS ===');
                } else {
                    console.log('Form submission failed');
                }
            } catch (error) {
                console.error('Error during form submission:', error);
                alert('Error adding record: ' + error.message);
            }
        });
        console.log('Academic record form event listener attached successfully');
    } else {
        console.error('Academic record form not found!');
    }

    // Add Grade Form
    document.getElementById('addGradeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const grade = {
            id: Date.now().toString(),
            studentId: formData.get('gradeStudentSelect'),
            type: formData.get('gradeTypeSelect'),
            title: formData.get('gradeTitle'),
            score: parseFloat(formData.get('gradeScore')),
            maxScore: parseFloat(formData.get('gradeMaxScore')),
            percentage: (parseFloat(formData.get('gradeScore')) / parseFloat(formData.get('gradeMaxScore')) * 100).toFixed(1),
            createdAt: new Date().toISOString()
        };
        
        grades.push(grade);
        saveData();
        renderGrades();
        renderReports();
        closeModal('addGradeModal');
        e.target.reset();
    });

    // Add Academic Filter Event Listeners
    const academicClassFilter = document.getElementById('academicClass');
    const academicSubjectFilter = document.getElementById('academicSubject');
    const academicStudentFilter = document.getElementById('academicStudent');
    const studentsClassFilter = document.getElementById('studentsClassFilter');

    if (academicClassFilter) {
        academicClassFilter.addEventListener('change', renderAcademicRecords);
    }
    if (academicSubjectFilter) {
        academicSubjectFilter.addEventListener('change', renderAcademicRecords);
    }
    if (academicStudentFilter) {
        academicStudentFilter.addEventListener('change', renderAcademicRecords);
    }
    if (studentsClassFilter) {
        console.log('Setting up studentsClassFilter event listener');
        studentsClassFilter.addEventListener('change', () => {
            console.log('Students class filter changed to:', studentsClassFilter.value);
            renderStudents();
        });
    } else {
        console.log('studentsClassFilter element not found!');
    }
}

// Setup academic record form handlers
function setupAcademicRecordForm() {
    console.log('Setting up academic record form...');
    
    const recordTypeSelect = document.getElementById('recordType');
    const assignmentNumberGroup = document.getElementById('assignmentNumberGroup');
    const marksInput = document.getElementById('recordMarks');
    const marksHelper = document.getElementById('marksHelper');
    const subjectInput = document.getElementById('recordSubject');
    
    if (!recordTypeSelect) {
        console.error('recordTypeSelect not found');
        return;
    }
    
    // Remove any existing event listeners to prevent duplicates
    const newRecordTypeSelect = recordTypeSelect.cloneNode(true);
    recordTypeSelect.parentNode.replaceChild(newRecordTypeSelect, recordTypeSelect);
    
    // Add the event listener to the new element
    newRecordTypeSelect.addEventListener('change', function() {
        console.log('Record type changed to:', this.value);
        
        const assignmentGroup = document.getElementById('assignmentNumberGroup');
        const marksField = document.getElementById('recordMarks');
        const helper = document.getElementById('marksHelper');
        
        if (this.value === 'assignment') {
            if (assignmentGroup) {
                assignmentGroup.style.display = 'block';
                console.log('Assignment number group shown');
            }
            if (marksField) {
                marksField.max = '20';
                marksField.setAttribute('max', '20');
            }
            if (helper) {
                helper.textContent = 'Enter marks out of 20';
            }
            // Set default assignment number and make it required
            const assignmentSelect = document.getElementById('assignmentNumber');
            if (assignmentSelect) {
                assignmentSelect.value = '1';
                assignmentSelect.setAttribute('required', 'required');
            }
        } else if (this.value === 'termtest') {
            if (assignmentGroup) {
                assignmentGroup.style.display = 'none';
                console.log('Assignment number group hidden');
            }
            if (marksField) {
                marksField.max = '100';
                marksField.setAttribute('max', '100');
            }
            if (helper) {
                helper.textContent = 'Enter marks out of 100';
            }
            // Remove required attribute from assignment number
            const assignmentSelect = document.getElementById('assignmentNumber');
            if (assignmentSelect) {
                assignmentSelect.removeAttribute('required');
            }
        } else {
            if (assignmentGroup) {
                assignmentGroup.style.display = 'none';
            }
            if (marksField) {
                marksField.removeAttribute('max');
            }
            if (helper) {
                helper.textContent = 'Select type first to see max marks';
            }
            // Remove required attribute from assignment number
            const assignmentSelect = document.getElementById('assignmentNumber');
            if (assignmentSelect) {
                assignmentSelect.removeAttribute('required');
            }
        }
    });
    
    console.log('Academic record form setup completed');
}

// Add academic record with validation
function addAcademicRecord(formData) {
    console.log('=== ADD ACADEMIC RECORD START ===');
    console.log('addAcademicRecord called with formData:', formData);
    
    const studentId = formData.get('recordStudentSelect');
    const type = formData.get('recordType');
    const subject = formData.get('recordSubject');
    const term = formData.get('recordTerm');
    const marks = parseInt(formData.get('recordMarks'));
    const assignmentNumber = formData.get('assignmentNumber');
    
    console.log('Extracted values:', { studentId, type, subject, term, marks, assignmentNumber });
    
    // Basic validation
    if (!studentId || studentId === '') {
        alert('Please select a student');
        return false;
    }
    
    if (!type || type === '') {
        alert('Please select a type (Assignment or Term Test)');
        return false;
    }
    
    if (!subject || subject.trim() === '') {
        alert('Please enter a subject');
        return false;
    }
    
    if (!term || term === '') {
        alert('Please select a term');
        return false;
    }
    
    if (isNaN(marks) || marks === null || marks === undefined) {
        alert('Please enter valid marks');
        return false;
    }
    
    // Validate assignment number for assignments
    if (type === 'assignment' && (!assignmentNumber || assignmentNumber === '')) {
        alert('Please select an assignment number for assignments');
        return false;
    }
    
    // Validate marks based on type
    const maxMarks = type === 'assignment' ? 20 : 100;
    if (marks < 0 || marks > maxMarks) {
        alert(`Marks should be between 0 and ${maxMarks} for ${type}`);
        return false;
    }
    
    console.log('All validations passed, creating record...');
    
    // Simplified duplicate check
    const duplicateCheck = academicRecords.find(record => {
        if (type === 'assignment') {
            return record.studentId === studentId && 
                   record.type === 'assignment' && 
                   record.subject === subject && 
                   record.term === term &&
                   record.assignmentNumber === assignmentNumber;
        } else {
            return record.studentId === studentId && 
                   record.type === 'termtest' && 
                   record.subject === subject && 
                   record.term === term;
        }
    });
    
    if (duplicateCheck) {
        if (type === 'assignment') {
            alert(`Assignment ${assignmentNumber} already exists for this student in ${term} term for ${subject}`);
        } else {
            alert(`Term test already exists for ${term} term in ${subject} for this student`);
        }
        return false;
    }
    
    const newRecord = {
        id: Date.now().toString(),
        studentId,
        type,
        subject,
        term,
        marks,
        maxMarks,
        assignmentNumber: type === 'assignment' ? assignmentNumber : null,
        grade: calculateGrade(marks, maxMarks),
        createdAt: new Date().toISOString()
    };
    
    console.log('New record created:', newRecord);
    
    academicRecords.push(newRecord);
    console.log('Academic records after push:', academicRecords);
    
    saveData();
    console.log('Data saved, calling render functions...');
    
    renderAcademicRecords();
    renderStudents();
    renderAssignmentTable();
    renderTermTestTable();
    populateSubjectOptions(); // Update subject options when new academic record is added
    
    console.log('All functions called, returning true');
    return true;
}

function populateStudentSelects() {
    const gradeStudentSelect = document.getElementById('gradeStudentSelect');
    const gradeStudentFilter = document.getElementById('gradeStudent');
    const recordStudentSelect = document.getElementById('recordStudentSelect');
    const academicStudentFilter = document.getElementById('academicStudent');
    
    // Clear existing options (except first option)
    gradeStudentSelect.innerHTML = '<option value="">Choose a student...</option>';
    if (gradeStudentFilter) gradeStudentFilter.innerHTML = '<option value="">All Students</option>';
    recordStudentSelect.innerHTML = '<option value="">Choose a student...</option>';
    academicStudentFilter.innerHTML = '<option value="">All Students</option>';
    
    students.forEach(student => {
        const option1 = new Option(`${student.name} (${student.studentId})`, student.id);
        const option2 = new Option(`${student.name} (${student.studentId})`, student.id);
        const option3 = new Option(`${student.name} (${student.studentId})`, student.id);
        const option4 = new Option(`${student.name} (${student.studentId})`, student.id);
        
        gradeStudentSelect.appendChild(option1);
        if (gradeStudentFilter) gradeStudentFilter.appendChild(option2);
        recordStudentSelect.appendChild(option3);
        academicStudentFilter.appendChild(option4);
    });
}

function populateClassOptions() {
    console.log('=== populateClassOptions() called ===');
    const reportClassFilter = document.getElementById('reportClass');
    const academicClassFilter = document.getElementById('academicClass');
    const studentsClassFilter = document.getElementById('studentsClassFilter');
    
    console.log('Students data available:', students.length);
    console.log('studentsClassFilter element exists:', !!studentsClassFilter);
    
    if (!reportClassFilter) {
        console.log('reportClassFilter element not found');
        return;
    }
    
    const uniqueClasses = [...new Set(students.map(s => s.class))].filter(Boolean);
    console.log('Unique classes found:', uniqueClasses);
    
    // Populate report class dropdown
    reportClassFilter.innerHTML = '<option value="">All Classes</option>';
    uniqueClasses.forEach(className => {
        const option = new Option(className, className);
        reportClassFilter.appendChild(option);
    });
    
    // Populate academic class dropdown if it exists
    if (academicClassFilter) {
        academicClassFilter.innerHTML = '<option value="">All Classes</option>';
        uniqueClasses.forEach(className => {
            const option = new Option(className, className);
            academicClassFilter.appendChild(option);
        });
    }
    
    // Populate students class filter if it exists
    if (studentsClassFilter) {
        // Store current selection
        const currentValue = studentsClassFilter.value;
        console.log('Current filter value before update:', currentValue);
        
        studentsClassFilter.innerHTML = '<option value="">All Classes</option>';
        uniqueClasses.forEach(className => {
            const option = new Option(className, className);
            studentsClassFilter.appendChild(option);
        });
        
        // Restore selection if it still exists
        if (currentValue && uniqueClasses.includes(currentValue)) {
            studentsClassFilter.value = currentValue;
            console.log('Restored filter value to:', currentValue);
        }
        
        console.log('Students class filter populated with', uniqueClasses.length, 'classes');
        console.log('Final dropdown options:', Array.from(studentsClassFilter.options).map(opt => opt.value));
    } else {
        console.log('studentsClassFilter element not found in DOM!');
    }
    
    console.log('Populated', uniqueClasses.length, 'classes in dropdowns');
}

// Debug function - can be called from browser console
function debugStudentFilter() {
    console.log('=== STUDENT FILTER DEBUG ===');
    console.log('Students in memory:', students.length);
    students.forEach((s, i) => console.log(`${i+1}. ${s.name} - Class: "${s.class}"`));
    
    const dropdown = document.getElementById('studentsClassFilter');
    console.log('Dropdown element exists:', !!dropdown);
    if (dropdown) {
        console.log('Current dropdown value:', dropdown.value);
        console.log('Dropdown options:', Array.from(dropdown.options).map(opt => `"${opt.value}"`));
    }
    
    const uniqueClasses = [...new Set(students.map(s => s.class))];
    console.log('Unique classes in data:', uniqueClasses.map(c => `"${c}"`));
    
    // Test filtering manually
    if (dropdown && dropdown.value) {
        const filtered = students.filter(s => s.class === dropdown.value);
        console.log(`Filtered students for "${dropdown.value}":`, filtered.length);
        filtered.forEach(s => console.log(`- ${s.name}`));
    }
}

// Debug function for attendance calculations
function debugAttendanceCalculations() {
    console.log('=== ATTENDANCE CALCULATIONS DEBUG ===');
    console.log('Start Date:', startDate);
    console.log('Total School Days:', totalSchoolDays);
    console.log('Attendance Data:', attendance);
    console.log('Attendance Dates (all):', Object.keys(attendance));
    
    // Check each attendance date
    Object.keys(attendance).forEach(date => {
        const dayData = attendance[date];
        const studentCount = dayData && dayData.students ? Object.keys(dayData.students).length : 0;
        console.log(`Date ${date}: ${studentCount} students have attendance records`);
    });
    
    const daysHeld = calculateDaysHeld();
    const availableDays = calculateAvailableDays();
    
    console.log('Days Held:', daysHeld);
    console.log('Available/Remaining Days:', availableDays);
    console.log('Expected calculation: 200 - 1 = 199 (if only 2025-08-28 has data)');
}

function populateSubjectOptions() {
    const academicSubjectFilter = document.getElementById('academicSubject');
    const reportSubjectFilter = document.getElementById('reportSubject');
    
    if (!academicSubjectFilter || !reportSubjectFilter) {
        console.log('Subject filter elements not found');
        return;
    }
    
    // Get subjects from academic records
    const academicSubjects = [...new Set(academicRecords.map(r => r.subject))];
    
    // Get subjects from teachers
    const teacherSubjects = [...new Set(teachers.map(t => t.subject))];
    
    // Combine and remove duplicates
    let allSubjects = [...new Set([...academicSubjects, ...teacherSubjects])];
    
    // Prioritize current teacher's subject (put it first)
    if (currentTeacher && currentTeacher.subject) {
        allSubjects = allSubjects.filter(s => s !== currentTeacher.subject);
        allSubjects.unshift(currentTeacher.subject);
    }
    
    console.log('Academic subjects:', academicSubjects);
    console.log('Teacher subjects:', teacherSubjects);
    console.log('All subjects combined:', allSubjects);
    
    academicSubjectFilter.innerHTML = '<option value="">All Subjects</option>';
    reportSubjectFilter.innerHTML = '<option value="">All Subjects</option>';
    
    allSubjects.forEach(subject => {
        const option1 = new Option(subject, subject);
        const option2 = new Option(subject, subject);
        academicSubjectFilter.appendChild(option1);
        reportSubjectFilter.appendChild(option2);
    });
    
    console.log('Populated', allSubjects.length, 'subjects in dropdowns');
}

function renderStudents() {
    const studentsGrid = document.getElementById('studentsGrid');
    const classFilter = document.getElementById('studentsClassFilter')?.value || '';
    
    console.log('=== renderStudents called ===');
    console.log('Selected class filter:', classFilter);
    console.log('Total students available:', students.length);
    
    // Show all available student classes for debugging
    if (students.length > 0) {
        const allClasses = students.map(s => s.class);
        console.log('Student classes in data:', allClasses);
    }
    
    // Filter students based on class
    let filteredStudents = students;
    if (classFilter) {
        filteredStudents = students.filter(s => s.class === classFilter);
        console.log(`Filtered to ${filteredStudents.length} students for class "${classFilter}"`);
    } else {
        console.log('No filter applied, showing all students');
    }
    
    if (filteredStudents.length === 0) {
        const message = classFilter ? 
            `No students found in class "${classFilter}"` : 
            'No students added yet';
        const subMessage = classFilter ? 
            'Try selecting a different class or add students to this class' : 
            'Click "Add Student" to get started';
            
        studentsGrid.innerHTML = `
            <div class="text-center" style="grid-column: 1 / -1; padding: 3rem;">
                <i class="fas fa-users" style="font-size: 3rem; color: #d1d5db; margin-bottom: 1rem;"></i>
                <h3 style="color: #6b7280;">${message}</h3>
                <p style="color: #9ca3af;">${subMessage}</p>
            </div>
        `;
        return;
    }
    
    studentsGrid.innerHTML = filteredStudents.map(student => {
        const attendanceStats = calculateStudentAttendance(student.id);
        const academicStats = calculateStudentAcademics(student.id);
        const overallPerformance = calculateOverallPerformance(student.id);
        const availableDays = calculateAvailableDays();
        const daysHeld = calculateDaysHeld();
        
        return `
            <div class="student-card">
                <div class="student-header">
                    <div class="student-avatar">${student.name.charAt(0).toUpperCase()}</div>
                    <div class="student-info">
                        <h3>${student.name}</h3>
                        <div class="student-id">ID: ${student.studentId}</div>
                        <div class="student-id">Class: ${student.class}</div>
                    </div>
                </div>
                <div class="student-detailed-stats">
                    <div class="stat-mini">
                        <div class="stat-value-mini">${totalSchoolDays}</div>
                        <div class="stat-label">Total Days</div>
                    </div>
                    <div class="stat-mini">
                        <div class="stat-value-mini">${daysHeld}</div>
                        <div class="stat-label">Days Held</div>
                    </div>
                    <div class="stat-mini">
                        <div class="stat-value-mini">${availableDays}</div>
                        <div class="stat-label">Remaining</div>
                    </div>
                    <div class="stat-mini">
                        <div class="stat-value-mini text-success">${attendanceStats.present}</div>
                        <div class="stat-label">Present</div>
                    </div>
                    <div class="stat-mini">
                        <div class="stat-value-mini text-danger">${attendanceStats.absent}</div>
                        <div class="stat-label">Absent</div>
                    </div>
                    <div class="stat-mini">
                        <div class="stat-value-mini ${attendanceStats.percentage >= 75 ? 'text-success' : attendanceStats.percentage >= 50 ? 'text-warning' : 'text-danger'}">${attendanceStats.percentage}%</div>
                        <div class="stat-label">Attendance</div>
                    </div>
                </div>
                <div class="student-stats">
                    <div class="stat">
                        <div class="stat-value ${academicStats.assignmentAvg >= 75 ? 'text-success' : academicStats.assignmentAvg >= 55 ? 'text-warning' : 'text-danger'}">${academicStats.assignmentAvg}</div>
                        <div class="stat-label">Assignment Avg</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value ${academicStats.termtestAvg >= 75 ? 'text-success' : academicStats.termtestAvg >= 55 ? 'text-warning' : 'text-danger'}">${academicStats.termtestAvg}</div>
                        <div class="stat-label">Term Test Avg</div>
                    </div>
                    <div class="stat">
                        <div class="performance-badge performance-${overallPerformance.level.toLowerCase()}">${overallPerformance.score}%</div>
                        <div class="stat-label">Overall Performance</div>
                    </div>
                </div>
                <div class="student-actions">
                    <button class="btn btn-small btn-warning" onclick="editStudent('${student.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-small btn-danger" onclick="deleteStudent('${student.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function calculateStudentAttendance(studentId) {
    const studentAttendance = Object.values(attendance).filter(record => 
        record.students && record.students[studentId]
    );
    
    const present = studentAttendance.filter(record => 
        record.students[studentId] === 'present'
    ).length;
    
    const total = studentAttendance.length;
    const absent = total - present;
    const daysHeld = calculateDaysHeld();
    const percentage = daysHeld > 0 ? Math.round((present / daysHeld) * 100) : 0;
    
    return { percentage, present, total, absent };
}

function calculateStudentGrades(studentId) {
    const studentGrades = grades.filter(grade => grade.studentId === studentId);
    
    if (studentGrades.length === 0) {
        return { average: 0, total: 0 };
    }
    
    const total = studentGrades.reduce((sum, grade) => sum + parseFloat(grade.percentage), 0);
    const average = Math.round(total / studentGrades.length);
    
    return { average, total: studentGrades.length };
}

function calculateStudentAcademics(studentId) {
    const studentRecords = academicRecords.filter(record => record.studentId === studentId);
    
    if (studentRecords.length === 0) {
        return { assignmentAvg: 0, termtestAvg: 0, total: 0 };
    }
    
    const assignments = studentRecords.filter(r => r.type === 'assignment');
    const termtests = studentRecords.filter(r => r.type === 'termtest');
    
    const assignmentAvg = assignments.length > 0 ? 
        Math.round(assignments.reduce((sum, r) => sum + r.marks, 0) / assignments.length) : 0;
    const termtestAvg = termtests.length > 0 ? 
        Math.round(termtests.reduce((sum, r) => sum + r.marks, 0) / termtests.length) : 0;
    
    return { assignmentAvg, termtestAvg, total: studentRecords.length };
}

function calculateOverallPerformance(studentId) {
    const attendanceStats = calculateStudentAttendance(studentId);
    const academicStats = calculateStudentAcademics(studentId);
    
    // Weighted calculation: 30% attendance, 35% assignments, 35% term tests
    const attendanceScore = attendanceStats.percentage * 0.3;
    const assignmentScore = academicStats.assignmentAvg * 0.35;
    const termtestScore = academicStats.termtestAvg * 0.35;
    
    const overallScore = Math.round(attendanceScore + assignmentScore + termtestScore);
    
    let level;
    if (overallScore >= 85) level = 'Excellent';
    else if (overallScore >= 70) level = 'Good';
    else if (overallScore >= 55) level = 'Average';
    else level = 'Poor';
    
    return { score: overallScore, level };
}

function calculateGrade(marks, maxMarks = 100) {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 75) return 'A';
    if (percentage >= 65) return 'B';
    if (percentage >= 55) return 'C';
    if (percentage >= 45) return 'S';
    return 'F';
}

function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student? This will also remove all their attendance and academic records.')) {
        students = students.filter(student => student.id !== studentId);
        grades = grades.filter(grade => grade.studentId !== studentId);
        academicRecords = academicRecords.filter(record => record.studentId !== studentId);
        
        // Remove from attendance records
        Object.keys(attendance).forEach(date => {
            if (attendance[date].students && attendance[date].students[studentId]) {
                delete attendance[date].students[studentId];
            }
        });
        
        saveData();
        renderStudents();
        renderAttendance();
        renderGrades();
        renderAcademicRecords();
        renderReports();
        populateStudentSelects();
        populateClassOptions();
        populateSubjectOptions();
    }
}

function editStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) {
        alert('Student not found!');
        return;
    }
    
    // Populate the edit form with current student data
    document.getElementById('editStudentHiddenId').value = student.id;
    document.getElementById('editStudentName').value = student.name;
    document.getElementById('editStudentId').value = student.studentId;
    document.getElementById('editStudentClass').value = student.class;
    document.getElementById('editStudentContact').value = student.contact || '';
    
    // Open the edit modal
    document.getElementById('editStudentModal').classList.add('show');
}

// Attendance Management
function markAttendance() {
    const selectedDate = document.getElementById('attendanceDate').value;
    if (!selectedDate) {
        alert('Please select a date');
        return;
    }
    
    if (students.length === 0) {
        alert('Please add students first');
        return;
    }
    
    // Initialize attendance for this date if it doesn't exist
    if (!attendance[selectedDate]) {
        attendance[selectedDate] = {
            date: selectedDate,
            students: {}
        };
    }
    
    renderAttendance();
}

function renderAttendance() {
    const attendanceList = document.getElementById('attendanceList');
    const selectedDate = document.getElementById('attendanceDate').value;
    
    if (!selectedDate) {
        attendanceList.innerHTML = '<p class="text-muted">Please select a date to mark attendance</p>';
        return;
    }
    
    if (students.length === 0) {
        attendanceList.innerHTML = '<p class="text-muted">No students available. Please add students first.</p>';
        return;
    }
    
    // Initialize attendance for this date if it doesn't exist
    if (!attendance[selectedDate]) {
        attendance[selectedDate] = {
            date: selectedDate,
            students: {}
        };
    }
    
    attendanceList.innerHTML = students.map(student => {
        const status = attendance[selectedDate].students[student.id] || 'unmarked';
        
        return `
            <div class="attendance-item">
                <div class="attendance-student">
                    <div class="student-avatar">${student.name.charAt(0).toUpperCase()}</div>
                    <div>
                        <h4>${student.name}</h4>
                        <p class="text-muted">ID: ${student.studentId}</p>
                    </div>
                </div>
                <div class="attendance-status">
                    <button class="status-btn present ${status === 'present' ? 'active' : ''}" 
                            onclick="setAttendance('${selectedDate}', '${student.id}', 'present')">
                        <i class="fas fa-check"></i> Present
                    </button>
                    <button class="status-btn absent ${status === 'absent' ? 'active' : ''}" 
                            onclick="setAttendance('${selectedDate}', '${student.id}', 'absent')">
                        <i class="fas fa-times"></i> Absent
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function setAttendance(date, studentId, status) {
    if (!attendance[date]) {
        attendance[date] = { date, students: {} };
    }
    
    attendance[date].students[studentId] = status;
    saveData();
    renderAttendance();
    renderStudents(); // Update student cards with new attendance
    renderReports();
}

// Grade Management
function openAddGradeModal() {
    if (students.length === 0) {
        alert('Please add students first');
        return;
    }
    document.getElementById('addGradeModal').classList.add('show');
}

// Academic Records Management
function openAddAcademicRecordModal() {
    console.log('=== openAddAcademicRecordModal START ===');
    
    try {
        // Find the modal element
        const modal = document.getElementById('addAcademicRecordModal');
        console.log('Modal element:', modal);
        
        if (!modal) {
            console.error('Modal element not found!');
            alert('Error: Modal not found. Please refresh the page.');
            return;
        }
        
        // Reset and show modal immediately
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        modal.style.zIndex = '1000';
        modal.classList.add('show');
        
        console.log('Modal styles applied directly');
        
        // Populate student dropdown
        const studentSelect = document.getElementById('recordStudentSelect');
        if (studentSelect) {
            console.log('Populating student dropdown...');
            studentSelect.innerHTML = '<option value="">Choose a student...</option>';
            
            console.log('Students array:', students);
            console.log('Students length:', students.length);
            
            if (students.length === 0) {
                studentSelect.innerHTML += '<option value="" disabled style="color: #999;">No students available - Add students first</option>';
                console.log('No students found - added placeholder');
            } else {
                students.forEach((student, index) => {
                    console.log(`Adding student ${index}:`, student);
                    const option = document.createElement('option');
                    option.value = student.id;
                    option.textContent = `${student.name} (${student.class})`;
                    studentSelect.appendChild(option);
                });
                console.log('Students populated successfully');
            }
        } else {
            console.error('Student select element not found!');
        }
        
        // Set teacher's subject as default
        const recordSubjectInput = document.getElementById('recordSubject');
        if (recordSubjectInput) {
            console.log('Setting subject field...');
            console.log('Current Teacher:', typeof currentTeacher !== 'undefined' ? currentTeacher : 'undefined');
            
            if (typeof currentTeacher !== 'undefined' && currentTeacher && currentTeacher.subject) {
                recordSubjectInput.value = currentTeacher.subject;
                recordSubjectInput.setAttribute('placeholder', `Default: ${currentTeacher.subject}`);
                console.log('Set subject to:', currentTeacher.subject);
            } else {
                recordSubjectInput.value = 'ICT';
                recordSubjectInput.setAttribute('placeholder', 'Default: ICT');
                console.log('Set subject to ICT (fallback)');
            }
        }
        
        // Reset all form fields
        console.log('Resetting form fields...');
        const formElements = {
            recordType: document.getElementById('recordType'),
            recordTerm: document.getElementById('recordTerm'),
            recordMarks: document.getElementById('recordMarks'),
            assignmentNumberGroup: document.getElementById('assignmentNumberGroup'),
            marksHelper: document.getElementById('marksHelper')
        };
        
        if (formElements.recordType) formElements.recordType.value = '';
        if (formElements.recordTerm) formElements.recordTerm.value = '';
        if (formElements.recordMarks) formElements.recordMarks.value = '';
        if (formElements.assignmentNumberGroup) formElements.assignmentNumberGroup.style.display = 'none';
        if (formElements.marksHelper) formElements.marksHelper.textContent = 'Select type first to see max marks';
        
        // Ensure form setup is properly initialized
        console.log('Setting up form event handlers...');
        setupAcademicRecordForm();
        
        console.log('Modal should now be visible');
        console.log('=== openAddAcademicRecordModal END ===');
        
    } catch (error) {
        console.error('Error in openAddAcademicRecordModal:', error);
        alert('Error opening modal: ' + error.message);
    }
}

// Test function to open modal directly
function testOpenModal() {
    console.log('Test function called');
    const modal = document.getElementById('addAcademicRecordModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.classList.add('show');
        console.log('Test modal opened');
    } else {
        console.log('Modal not found in test');
    }
}

// Make functions available globally for testing
window.openAddAcademicRecordModal = openAddAcademicRecordModal;
window.testOpenModal = testOpenModal;
window.closeModal = closeModal;

// Test function to add a record directly
window.testAddRecord = function() {
    console.log('Testing direct record addition...');
    console.log('Students:', students);
    console.log('Academic records before:', academicRecords);
    
    if (students.length === 0) {
        alert('Please add a student first to test this function');
        return;
    }
    
    const testRecord = {
        id: Date.now().toString(),
        studentId: students[0].id,
        type: 'assignment',
        subject: 'ICT',
        term: 'first',
        marks: 15,
        maxMarks: 20,
        assignmentNumber: '1',
        grade: 'B',
        createdAt: new Date().toISOString()
    };
    
    academicRecords.push(testRecord);
    saveData();
    renderAcademicRecords();
    
    console.log('Academic records after:', academicRecords);
    alert('Test record added successfully!');
};

function renderAcademicRecords() {
    const classFilter = document.getElementById('academicClass').value;
    const subjectFilter = document.getElementById('academicSubject').value;
    const studentFilter = document.getElementById('academicStudent').value;
    
    // Filter students based on selected criteria
    let filteredStudents = students;
    if (classFilter) {
        filteredStudents = filteredStudents.filter(s => s.class === classFilter);
    }
    if (studentFilter) {
        filteredStudents = filteredStudents.filter(s => s.id === studentFilter);
    }
    
    // Always show both sections since we removed type filter
    const assignmentSection = document.getElementById('assignmentSection');
    const termTestSection = document.getElementById('termTestSection');
    assignmentSection.style.display = 'block';
    termTestSection.style.display = 'block';
    
    // Render Assignment Table
    renderAssignmentTable(filteredStudents, subjectFilter);
    
    // Render Term Test Table  
    renderTermTestTable(filteredStudents, subjectFilter);
}

function renderAssignmentTable(students, subjectFilter) {
    console.log('renderAssignmentTable called with:', { students, subjectFilter });
    console.log('academicRecords:', academicRecords);
    
    const tableBody = document.getElementById('assignmentTableBody');
    
    if (students.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center" style="padding: 2rem;">
                    <i class="fas fa-clipboard-list" style="font-size: 2rem; color: #d1d5db; margin-bottom: 1rem;"></i>
                    <div style="color: #6b7280;">No students found</div>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = students.map(student => {
        // Get assignment records for this student
        let assignmentRecords = academicRecords.filter(record => 
            record.studentId === student.id && 
            record.type === 'assignment'
        );
        
        // Apply filters
        if (subjectFilter) {
            assignmentRecords = assignmentRecords.filter(record => record.subject === subjectFilter);
        }
        
        // Create assignment marks array (5 assignments)
        const assignments = [1, 2, 3, 4, 5].map(num => {
            const assignment = assignmentRecords.find(record => 
                record.assignmentNumber === num.toString()
            );
            return assignment ? assignment.marks : '-';
        });
        
        // Calculate total and average
        const validMarks = assignments.filter(mark => mark !== '-');
        const total = validMarks.reduce((sum, mark) => sum + mark, 0);
        const totalOutOf100 = validMarks.length > 0 ? (total / validMarks.length) * 5 : 0; // Convert to out of 100
        const average = validMarks.length > 0 ? Math.round(totalOutOf100) : '-';
        const grade = validMarks.length > 0 ? calculateGrade(totalOutOf100) : '-';
        
        // Helper function to get mark cell class
        const getMarkCellClass = (mark) => {
            if (mark === '-') return '';
            const percentage = (mark / 20) * 100;
            if (percentage >= 75) return 'excellent';
            if (percentage >= 65) return 'good';
            if (percentage >= 55) return 'average';
            return 'poor';
        };
        
        return `
            <tr>
                <td class="student-id">${student.studentId}</td>
                <td class="student-name">${student.name}</td>
                <td class="marks-cell editable-marks ${getMarkCellClass(assignments[0])}" 
                    data-student-id="${student.id}" 
                    data-assignment="1" 
                    data-max="20"
                    onclick="editMarksCell(this)"
                    title="Click to edit (Max: 20)">${assignments[0] === '-' ? '' : assignments[0]}</td>
                <td class="marks-cell editable-marks ${getMarkCellClass(assignments[1])}" 
                    data-student-id="${student.id}" 
                    data-assignment="2" 
                    data-max="20"
                    onclick="editMarksCell(this)"
                    title="Click to edit (Max: 20)">${assignments[1] === '-' ? '' : assignments[1]}</td>
                <td class="marks-cell editable-marks ${getMarkCellClass(assignments[2])}" 
                    data-student-id="${student.id}" 
                    data-assignment="3" 
                    data-max="20"
                    onclick="editMarksCell(this)"
                    title="Click to edit (Max: 20)">${assignments[2] === '-' ? '' : assignments[2]}</td>
                <td class="marks-cell editable-marks ${getMarkCellClass(assignments[3])}" 
                    data-student-id="${student.id}" 
                    data-assignment="4" 
                    data-max="20"
                    onclick="editMarksCell(this)"
                    title="Click to edit (Max: 20)">${assignments[3] === '-' ? '' : assignments[3]}</td>
                <td class="marks-cell editable-marks ${getMarkCellClass(assignments[4])}" 
                    data-student-id="${student.id}" 
                    data-assignment="5" 
                    data-max="20"
                    onclick="editMarksCell(this)"
                    title="Click to edit (Max: 20)">${assignments[4] === '-' ? '' : assignments[4]}</td>
                <td class="total-cell">${total}</td>
                <td class="average-cell">${average}</td>
                <td class="grade-cell grade-${grade.toLowerCase()}">${grade}</td>
            </tr>
        `;
    }).join('');
}

function renderTermTestTable(students, subjectFilter) {
    const tableBody = document.getElementById('termTestTableBody');
    
    if (students.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center" style="padding: 2rem;">
                    <i class="fas fa-graduation-cap" style="font-size: 2rem; color: #d1d5db; margin-bottom: 1rem;"></i>
                    <div style="color: #6b7280;">No students found</div>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = students.map(student => {
        // Get term test records for this student
        let termTestRecords = academicRecords.filter(record => 
            record.studentId === student.id && 
            record.type === 'termtest'
        );
        
        // Apply subject filter
        if (subjectFilter) {
            termTestRecords = termTestRecords.filter(record => record.subject === subjectFilter);
        }
        
        // Get marks for each term
        const firstTerm = termTestRecords.find(record => record.term === 'first');
        const secondTerm = termTestRecords.find(record => record.term === 'second');
        const thirdTerm = termTestRecords.find(record => record.term === 'third');
        
        const firstMarks = firstTerm ? firstTerm.marks : '-';
        const secondMarks = secondTerm ? secondTerm.marks : '-';
        const thirdMarks = thirdTerm ? thirdTerm.marks : '-';
        
        const firstGrade = firstTerm ? calculateGrade(firstTerm.marks) : '-';
        const secondGrade = secondTerm ? calculateGrade(secondTerm.marks) : '-';
        const thirdGrade = thirdTerm ? calculateGrade(thirdTerm.marks) : '-';
        
        // Calculate average
        const validMarks = [firstMarks, secondMarks, thirdMarks].filter(mark => mark !== '-');
        const average = validMarks.length > 0 ? Math.round(validMarks.reduce((sum, mark) => sum + mark, 0) / validMarks.length) : '-';
        
        // Helper function to get mark cell class for term tests
        const getTermMarkCellClass = (mark) => {
            if (mark === '-') return '';
            if (mark >= 75) return 'excellent';
            if (mark >= 65) return 'good';
            if (mark >= 55) return 'average';
            return 'poor';
        };
        
        return `
            <tr>
                <td class="student-id">${student.studentId}</td>
                <td class="student-name">${student.name}</td>
                <td class="marks-cell editable-marks ${getTermMarkCellClass(firstMarks)}" 
                    data-student-id="${student.id}" 
                    data-term="first" 
                    data-max="100"
                    onclick="editTermMarksCell(this)"
                    title="Click to edit (Max: 100)">${firstMarks === '-' ? '' : firstMarks}</td>
                <td class="grade-cell grade-${firstGrade.toLowerCase()}">${firstGrade}</td>
                <td class="marks-cell editable-marks ${getTermMarkCellClass(secondMarks)}" 
                    data-student-id="${student.id}" 
                    data-term="second" 
                    data-max="100"
                    onclick="editTermMarksCell(this)"
                    title="Click to edit (Max: 100)">${secondMarks === '-' ? '' : secondMarks}</td>
                <td class="grade-cell grade-${secondGrade.toLowerCase()}">${secondGrade}</td>
                <td class="marks-cell editable-marks ${getTermMarkCellClass(thirdMarks)}" 
                    data-student-id="${student.id}" 
                    data-term="third" 
                    data-max="100"
                    onclick="editTermMarksCell(this)"
                    title="Click to edit (Max: 100)">${thirdMarks === '-' ? '' : thirdMarks}</td>
                <td class="grade-cell grade-${thirdGrade.toLowerCase()}">${thirdGrade}</td>
                <td class="average-cell">${average}</td>
            </tr>
        `;
    }).join('');
}

// ===== EDITABLE TABLES FUNCTIONALITY =====

// Academic Records functionality with editable tables
let editingCell = null;
let academicData = JSON.parse(localStorage.getItem('academicRecords')) || [];
let unsavedChanges = false;

function initializeEditableTables() {
    console.log('Initializing editable tables...');
    // Load existing data
    loadAcademicData();
    renderEditableAssignmentTable();
    renderEditableTermTestTable();
    
    // Set up auto-save
    setInterval(autoSave, 30000); // Auto-save every 30 seconds
    
    // Add event listeners for controls
    setupAcademicControls();
}

function setupAcademicControls() {
    // Add new student row
    const addStudentBtn = document.querySelector('[onclick="addNewStudentRow()"]');
    if (addStudentBtn) {
        addStudentBtn.onclick = addNewStudentRow;
    }
    
    // Save all changes
    const saveAllBtn = document.querySelector('[onclick="saveAllChanges()"]');
    if (saveAllBtn) {
        saveAllBtn.onclick = saveAllChanges;
    }
    
    // Export data
    const exportBtn = document.querySelector('[onclick="exportAcademicData()"]');
    if (exportBtn) {
        exportBtn.onclick = exportAcademicData;
    }
}

function loadAcademicData() {
    try {
        // Try to load from existing academic records
        if (academicRecords && academicRecords.length > 0) {
            // Transform old format to new format
            academicData = transformOldToNewFormat(academicRecords);
        } else {
            const stored = localStorage.getItem('editableAcademicData');
            academicData = stored ? JSON.parse(stored) : [];
        }
        console.log('Loaded academic data:', academicData);
    } catch (error) {
        console.error('Error loading academic data:', error);
        academicData = [];
    }
}

function transformOldToNewFormat(oldRecords) {
    const transformed = [];
    const studentMap = new Map();
    
    // Group records by student
    oldRecords.forEach(record => {
        const key = `${record.studentName}_${record.class || ''}`;
        if (!studentMap.has(key)) {
            studentMap.set(key, {
                id: Date.now() + Math.random(),
                studentName: record.studentName,
                class: record.class || '',
                assignments: {},
                termTests: {}
            });
        }
        
        const student = studentMap.get(key);
        if (record.type === 'assignment') {
            const assignmentKey = `assignment${record.assignmentNumber || 1}`;
            student.assignments[assignmentKey] = record.marks;
        } else if (record.type === 'termtest') {
            const termKey = `termTest${record.term || 1}`;
            student.termTests[termKey] = record.marks;
        }
    });
    
    return Array.from(studentMap.values());
}

function addNewStudentRow() {
    const newStudent = {
        id: Date.now(),
        studentName: '',
        class: '',
        assignments: {
            assignment1: '',
            assignment2: '',
            assignment3: '',
            assignment4: '',
            assignment5: ''
        },
        termTests: {
            termTest1: '',
            termTest2: '',
            termTest3: ''
        },
        isNew: true
    };
    
    academicData.push(newStudent);
    renderEditableAssignmentTable();
    renderEditableTermTestTable();
    markUnsaved();
}

function deleteStudentRow(studentId) {
    if (confirm('Are you sure you want to delete this student record?')) {
        academicData = academicData.filter(student => student.id !== studentId);
        renderEditableAssignmentTable();
        renderEditableTermTestTable();
        markUnsaved();
        showSaveIndicator('Changes pending save', 'saving');
    }
}

function duplicateStudentRow(studentId) {
    const student = academicData.find(s => s.id === studentId);
    if (student) {
        const newStudent = {
            ...JSON.parse(JSON.stringify(student)),
            id: Date.now(),
            studentName: student.studentName + ' (Copy)',
            isNew: true
        };
        academicData.push(newStudent);
        renderEditableAssignmentTable();
        renderEditableTermTestTable();
        markUnsaved();
    }
}

function renderEditableAssignmentTable() {
    const container = document.getElementById('assignment-table-container');
    if (!container) return;
    
    let html = `
        <table class="editable-table">
            <thead>
                <tr>
                    <th>Student Name</th>
                    <th>Class</th>
                    <th class="assignment-col">Assignment 1<br><small>Max: 20</small></th>
                    <th class="assignment-col">Assignment 2<br><small>Max: 20</small></th>
                    <th class="assignment-col">Assignment 3<br><small>Max: 20</small></th>
                    <th class="assignment-col">Assignment 4<br><small>Max: 20</small></th>
                    <th class="assignment-col">Assignment 5<br><small>Max: 20</small></th>
                    <th class="total-col">Total<br><small>Out of 100</small></th>
                    <th class="avg-col">Average %</th>
                    <th class="grade-col">Grade</th>
                    <th class="action-col">Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    academicData.forEach(student => {
        const assignments = student.assignments || {};
        const total = calculateAssignmentTotal(assignments);
        const average = total > 0 ? (total).toFixed(1) : 0;
        const grade = calculateGrade(average);
        
        const rowClass = student.isNew ? 'new-student-row' : '';
        
        html += `
            <tr class="${rowClass}">
                <td class="editable-cell" data-student-id="${student.id}" data-field="studentName" onclick="editCell(this)">${student.studentName || 'Click to edit'}</td>
                <td class="editable-cell" data-student-id="${student.id}" data-field="class" onclick="editCell(this)">${student.class || 'Click to edit'}</td>
                <td class="editable-cell" data-student-id="${student.id}" data-field="assignment1" data-max="20" onclick="editCell(this)">${assignments.assignment1 || ''}</td>
                <td class="editable-cell" data-student-id="${student.id}" data-field="assignment2" data-max="20" onclick="editCell(this)">${assignments.assignment2 || ''}</td>
                <td class="editable-cell" data-student-id="${student.id}" data-field="assignment3" data-max="20" onclick="editCell(this)">${assignments.assignment3 || ''}</td>
                <td class="editable-cell" data-student-id="${student.id}" data-field="assignment4" data-max="20" onclick="editCell(this)">${assignments.assignment4 || ''}</td>
                <td class="editable-cell" data-student-id="${student.id}" data-field="assignment5" data-max="20" onclick="editCell(this)">${assignments.assignment5 || ''}</td>
                <td class="total-cell">${total}</td>
                <td class="avg-col">${average}%</td>
                <td class="grade-cell grade-${grade.toLowerCase()}">${grade}</td>
                <td class="action-col">
                    <button class="action-btn btn-copy" onclick="duplicateStudentRow(${student.id})" title="Duplicate">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteStudentRow(${student.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderEditableTermTestTable() {
    const container = document.getElementById('termtest-table-container');
    if (!container) return;
    
    let html = `
        <table class="editable-table">
            <thead>
                <tr>
                    <th>Student Name</th>
                    <th>Class</th>
                    <th class="termtest-col">Term Test 1<br><small>Max: 100</small></th>
                    <th class="termtest-col">Term Test 2<br><small>Max: 100</small></th>
                    <th class="termtest-col">Term Test 3<br><small>Max: 100</small></th>
                    <th class="avg-col">Average %</th>
                    <th class="grade-col">Grade</th>
                    <th class="final-grade-col">Final Grade</th>
                    <th class="action-col">Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    academicData.forEach(student => {
        const termTests = student.termTests || {};
        const assignments = student.assignments || {};
        
        const termAverage = calculateTermTestAverage(termTests);
        const assignmentTotal = calculateAssignmentTotal(assignments);
        const termGrade = calculateGrade(termAverage);
        const finalGrade = calculateFinalGrade(assignmentTotal, termAverage);
        
        const rowClass = student.isNew ? 'new-student-row' : '';
        
        html += `
            <tr class="${rowClass}">
                <td class="editable-cell" data-student-id="${student.id}" data-field="studentName" onclick="editCell(this)">${student.studentName || 'Click to edit'}</td>
                <td class="editable-cell" data-student-id="${student.id}" data-field="class" onclick="editCell(this)">${student.class || 'Click to edit'}</td>
                <td class="editable-cell" data-student-id="${student.id}" data-field="termTest1" data-max="100" onclick="editCell(this)">${termTests.termTest1 || ''}</td>
                <td class="editable-cell" data-student-id="${student.id}" data-field="termTest2" data-max="100" onclick="editCell(this)">${termTests.termTest2 || ''}</td>
                <td class="editable-cell" data-student-id="${student.id}" data-field="termTest3" data-max="100" onclick="editCell(this)">${termTests.termTest3 || ''}</td>
                <td class="avg-col">${termAverage.toFixed(1)}%</td>
                <td class="grade-col grade-${termGrade}">${termGrade}</td>
                <td class="final-grade-col grade-${finalGrade}">${finalGrade}</td>
                <td class="action-col">
                    <button class="action-btn btn-copy" onclick="duplicateStudentRow(${student.id})" title="Duplicate">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteStudentRow(${student.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function editCell(cell) {
    // Close any existing editing cell
    if (editingCell && editingCell !== cell) {
        saveCell(editingCell);
    }
    
    editingCell = cell;
    const currentValue = cell.textContent.trim();
    const maxValue = cell.getAttribute('data-max');
    
    // Don't edit if it's "Click to edit" placeholder
    const valueToEdit = (currentValue === 'Click to edit') ? '' : currentValue;
    
    cell.classList.add('editing');
    cell.innerHTML = `<input type="${maxValue ? 'number' : 'text'}" value="${valueToEdit}" 
                      ${maxValue ? `max="${maxValue}" min="0"` : ''} 
                      onblur="saveCell(this.parentElement)" 
                      onkeydown="handleCellKeydown(event, this.parentElement)"
                      style="width: 100%; border: none; outline: none; background: transparent; text-align: center;">`;
    
    const input = cell.querySelector('input');
    input.focus();
    input.select();
}

function handleCellKeydown(event, cell) {
    if (event.key === 'Enter') {
        event.preventDefault();
        saveCell(cell);
        // Move to next editable cell
        moveToNextCell(cell);
    } else if (event.key === 'Escape') {
        event.preventDefault();
        cancelEdit(cell);
    }
}

function moveToNextCell(currentCell) {
    const row = currentCell.parentElement;
    const cells = Array.from(row.querySelectorAll('.editable-cell'));
    const currentIndex = cells.indexOf(currentCell);
    
    if (currentIndex < cells.length - 1) {
        // Move to next cell in same row
        editCell(cells[currentIndex + 1]);
    } else {
        // Move to first cell of next row
        const nextRow = row.nextElementSibling;
        if (nextRow) {
            const nextRowCells = nextRow.querySelectorAll('.editable-cell');
            if (nextRowCells.length > 0) {
                editCell(nextRowCells[0]);
            }
        }
    }
}

function cancelEdit(cell) {
    const studentId = cell.getAttribute('data-student-id');
    const field = cell.getAttribute('data-field');
    const student = academicData.find(s => s.id == studentId);
    
    if (student) {
        let originalValue = '';
        if (field === 'studentName') {
            originalValue = student.studentName || 'Click to edit';
        } else if (field === 'class') {
            originalValue = student.class || 'Click to edit';
        } else if (field.startsWith('assignment')) {
            originalValue = student.assignments[field] || '';
        } else if (field.startsWith('termTest')) {
            originalValue = student.termTests[field] || '';
        }
        
        cell.textContent = originalValue;
    }
    
    cell.classList.remove('editing');
    editingCell = null;
}

function saveCell(cell) {
    const input = cell.querySelector('input');
    if (!input) return;
    
    const value = input.value.trim();
    const studentId = cell.getAttribute('data-student-id');
    const field = cell.getAttribute('data-field');
    const maxValue = cell.getAttribute('data-max');
    
    // Validate numeric fields
    if (maxValue && value !== '') {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0 || numValue > maxValue) {
            cell.classList.add('cell-invalid');
            setTimeout(() => cell.classList.remove('cell-invalid'), 2000);
            input.focus();
            return;
        }
    }
    
    // Find student and update data
    const student = academicData.find(s => s.id == studentId);
    if (student) {
        if (field === 'studentName') {
            student.studentName = value;
            student.isNew = false;
        } else if (field === 'class') {
            student.class = value;
        } else if (field.startsWith('assignment')) {
            if (!student.assignments) student.assignments = {};
            student.assignments[field] = value;
        } else if (field.startsWith('termTest')) {
            if (!student.termTests) student.termTests = {};
            student.termTests[field] = value;
        }
    }
    
    // Update display
    cell.textContent = value || (field === 'studentName' || field === 'class' ? 'Click to edit' : '');
    cell.classList.remove('editing');
    cell.classList.add('cell-valid');
    setTimeout(() => cell.classList.remove('cell-valid'), 1000);
    
    editingCell = null;
    markUnsaved();
    
    // Re-render tables to update calculations
    renderEditableAssignmentTable();
    renderEditableTermTestTable();
}

// ===== INLINE EDITING FUNCTIONALITY =====

let currentEditingCell = null;
let unsavedAcademicChanges = false;

// Function to edit assignment marks cells
function editMarksCell(cell) {
    if (currentEditingCell) {
        saveCurrentEdit();
    }
    
    currentEditingCell = cell;
    const currentValue = cell.textContent.trim();
    const maxValue = cell.dataset.max;
    
    const input = document.createElement('input');
    input.type = 'number';
    input.value = currentValue;
    input.min = '0';
    input.max = maxValue;
    input.className = 'inline-edit-input';
    input.style.width = '60px';
    input.style.textAlign = 'center';
    
    // Save on Enter or blur
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveCurrentEdit();
        }
    });
    
    input.addEventListener('blur', function() {
        setTimeout(() => saveCurrentEdit(), 100);
    });
    
    cell.innerHTML = '';
    cell.appendChild(input);
    input.focus();
    input.select();
}

// Function to edit term test marks cells
function editTermMarksCell(cell) {
    if (currentEditingCell) {
        saveCurrentEdit();
    }
    
    currentEditingCell = cell;
    const currentValue = cell.textContent.trim();
    const maxValue = cell.dataset.max;
    
    const input = document.createElement('input');
    input.type = 'number';
    input.value = currentValue;
    input.min = '0';
    input.max = maxValue;
    input.className = 'inline-edit-input';
    input.style.width = '80px';
    input.style.textAlign = 'center';
    
    // Save on Enter or blur
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveCurrentEdit();
        }
    });
    
    input.addEventListener('blur', function() {
        setTimeout(() => saveCurrentEdit(), 100);
    });
    
    cell.innerHTML = '';
          cell.appendChild(input);
    input.focus();
    input.select();
}

// Function to save the current edit
function saveCurrentEdit() {
    if (!currentEditingCell) return;
    
    const input = currentEditingCell.querySelector('input');
    if (!input) return;
    
    const newValue = parseFloat(input.value) || '';
    const maxValue = parseFloat(currentEditingCell.dataset.max);
    const studentId = currentEditingCell.dataset.studentId;
    
    // Validate the input
    if (newValue !== '' && (newValue < 0 || newValue > maxValue)) {
        alert(`Please enter a value between 0 and ${maxValue}`);
        input.focus();
        return;
    }
    
    // Update the cell display
    currentEditingCell.textContent = newValue;
    
    // Update the academic records data
    if (currentEditingCell.dataset.assignment) {
        // Assignment record
        updateAssignmentRecord(studentId, currentEditingCell.dataset.assignment, newValue);
    } else if (currentEditingCell.dataset.term) {
        // Term test record
        updateTermTestRecord(studentId, currentEditingCell.dataset.term, newValue);
    }
    
    // Update visual styling based on new value
    updateCellStyling(currentEditingCell, newValue, maxValue);
    
    // Mark as unsaved and refresh calculations
    markAcademicUnsaved();
    refreshTableCalculations();
    
    currentEditingCell = null;
}

// Function to update assignment record
function updateAssignmentRecord(studentId, assignmentNumber, marks) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    // Find existing record or create new one
    let record = academicRecords.find(r => 
        r.studentId === studentId && 
        r.type === 'assignment' && 
        r.assignmentNumber === assignmentNumber
    );
    
    if (marks === '' || marks === 0) {
        // Remove record if marks is empty
        if (record) {
            academicRecords = academicRecords.filter(r => r !== record);
        }
    } else {
        if (record) {
            record.marks = marks;
        } else {
            // Create new record
            academicRecords.push({
                id: Date.now() + Math.random(),
                studentId: studentId,
                studentName: student.name,
                type: 'assignment',
                subject: currentTeacher ? currentTeacher.subject : 'General',
                term: 'first', // Default term
                marks: marks,
                assignmentNumber: assignmentNumber,
                date: new Date().toISOString().split('T')[0]
            });
        }
    }
    
    // Save to localStorage
    localStorage.setItem('academicRecords', JSON.stringify(academicRecords));
}

// Function to update term test record
function updateTermTestRecord(studentId, term, marks) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    // Find existing record or create new one
    let record = academicRecords.find(r => 
        r.studentId === studentId && 
        r.type === 'termtest' && 
        r.term === term
    );
    
    if (marks === '' || marks === 0) {
        // Remove record if marks is empty
        if (record) {
            academicRecords = academicRecords.filter(r => r !== record);
        }
    } else {
        if (record) {
            record.marks = marks;
        } else {
            // Create new record
            academicRecords.push({
                id: Date.now() + Math.random(),
                studentId: studentId,
                studentName: student.name,
                type: 'termtest',
                subject: currentTeacher ? currentTeacher.subject : 'General',
                term: term,
                marks: marks,
                date: new Date().toISOString().split('T')[0]
            });
        }
    }
    
    // Save to localStorage
    localStorage.setItem('academicRecords', JSON.stringify(academicRecords));
}

// Function to update cell styling based on marks
function updateCellStyling(cell, marks, maxValue) {
    // Remove existing classes
    cell.classList.remove('excellent', 'good', 'average', 'poor');
    
    if (marks === '' || marks === 0) return;
    
    const percentage = (marks / maxValue) * 100;
    if (percentage >= 75) {
        cell.classList.add('excellent');
    } else if (percentage >= 65) {
        cell.classList.add('good');
    } else if (percentage >= 55) {
        cell.classList.add('average');
    } else {
        cell.classList.add('poor');
    }
}

// Function to mark academic records as having unsaved changes
function markAcademicUnsaved() {
    unsavedAcademicChanges = true;
    const indicator = document.getElementById('saveIndicator');
    if (indicator) {
        indicator.textContent = 'Unsaved changes';
        indicator.className = 'save-indicator unsaved';
    }
}

// Function to refresh table calculations (totals, averages, grades)
function refreshTableCalculations() {
    // Re-render the tables to update calculations
    setTimeout(() => {
        renderAcademicRecords();
    }, 100);
}

// Function to save all academic changes
function saveAllAcademicChanges() {
    if (currentEditingCell) {
        saveCurrentEdit();
    }
    
    // Data is already saved to localStorage in real-time
    unsavedAcademicChanges = false;
    const indicator = document.getElementById('saveIndicator');
    const autoSaveText = document.querySelector('.auto-save-text');
    
    if (indicator) {
        indicator.textContent = 'All changes saved';
        indicator.className = 'save-indicator saved';
    }
    
    // Hide auto-save text temporarily when manual save is done
    if (autoSaveText) {
        autoSaveText.style.display = 'none';
    }
    
    // Show success message briefly
    setTimeout(() => {
        if (indicator && indicator.className.includes('saved')) {
            indicator.textContent = 'Auto-saving enabled';
            indicator.className = 'save-indicator';
        }
        // Show auto-save text again after the success message
        if (autoSaveText) {
            autoSaveText.style.display = 'flex';
        }
    }, 2000);
}

// Auto-save function
function autoSave() {
    if (unsavedChanges || unsavedAcademicChanges) {
        console.log('Auto-saving data...');
        
        // Save current edit if there's one active
        if (currentEditingCell) {
            saveCurrentEdit();
        }
        
        // Data is already saved to localStorage in real-time
        // Just update the indicator
        const indicator = document.getElementById('saveIndicator');
        if (indicator) {
            indicator.textContent = 'Auto-saved';
            indicator.className = 'save-indicator saved';
            
            // Return to normal state after 2 seconds
            setTimeout(() => {
                indicator.textContent = 'Auto-saving enabled';
                indicator.className = 'save-indicator';
            }, 2000);
        }
        
        unsavedChanges = false;
        unsavedAcademicChanges = false;
    }
}

// Show save indicator function
function showSaveIndicator(message, type) {
    const indicator = document.getElementById('saveIndicator');
    if (indicator) {
        indicator.textContent = message;
        indicator.className = `save-indicator ${type}`;
    }
}

// ===== REPORTS FUNCTIONALITY =====

// Function to render reports
function renderReports() {
    console.log('Rendering reports...');
    populateReportDropdowns();
    updateReportContent();
    setupReportEventListeners();
}

// Populate all report dropdowns
function populateReportDropdowns() {
    populateReportClassOptions();
    populateReportSubjectOptions();
    console.log('Report dropdowns populated');
}

// Populate class options for reports
function populateReportClassOptions() {
    const reportClassSelect = document.getElementById('reportClass');
    if (!reportClassSelect) return;
    
    const classes = [...new Set(students.map(student => student.class))].filter(cls => cls);
    
    reportClassSelect.innerHTML = '<option value="">All Classes</option>';
    classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls;
        option.textContent = cls;
        reportClassSelect.appendChild(option);
    });
}

// Populate subject options for reports  
function populateReportSubjectOptions() {
    const reportSubjectSelect = document.getElementById('reportSubject');
    if (!reportSubjectSelect) return;
    
    // Get unique subjects from academic records
    const subjects = [...new Set(academicRecords.map(record => record.subject))].filter(subj => subj);
    
    reportSubjectSelect.innerHTML = '<option value="">All Subjects</option>';
    
    // Add teacher's subject as default/primary option
    if (currentTeacher && currentTeacher.subject) {
        const teacherOption = document.createElement('option');
        teacherOption.value = currentTeacher.subject;
        teacherOption.textContent = `${currentTeacher.subject} (Your Subject)`;
        teacherOption.selected = true; // Auto-select teacher's subject
        reportSubjectSelect.appendChild(teacherOption);
    }
    
    // Add other subjects if they exist and are different from teacher's subject
    subjects.forEach(subject => {
        if (!currentTeacher || subject !== currentTeacher.subject) {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            reportSubjectSelect.appendChild(option);
        }
    });
}

// Setup event listeners for report filters
function setupReportEventListeners() {
    const reportType = document.getElementById('reportType');
    const reportClass = document.getElementById('reportClass');
    const reportTerm = document.getElementById('reportTerm');
    const reportSubject = document.getElementById('reportSubject');
    
    if (reportType) {
        reportType.addEventListener('change', updateReportContent);
    }
    if (reportClass) {
        reportClass.addEventListener('change', updateReportContent);
    }
    if (reportTerm) {
        reportTerm.addEventListener('change', updateReportContent);
    }
    if (reportSubject) {
        reportSubject.addEventListener('change', updateReportContent);
    }
}

// Update report content based on selected filters
function updateReportContent() {
    const reportType = document.getElementById('reportType').value;
    const reportClass = document.getElementById('reportClass').value;
    const reportTerm = document.getElementById('reportTerm').value;
    const reportSubject = document.getElementById('reportSubject').value;
    
    // Update report title
    updateReportTitle(reportType, reportClass, reportSubject, reportTerm);
    
    // Generate report content
    let reportContent = '';
    switch (reportType) {
        case 'attendance':
            reportContent = generateAttendanceReport(reportClass);
            break;
        case 'assignment':
            reportContent = generateAssignmentReport(reportClass, reportSubject, reportTerm);
            break;
        case 'termtest':
            reportContent = generateTermTestReport(reportClass, reportSubject);
            break;
        case 'overall':
            reportContent = generateOverallReport(reportClass, reportSubject);
            break;
        default:
            reportContent = generateAttendanceReport(reportClass);
    }
    
    document.getElementById('dynamicReport').innerHTML = reportContent;
}

// Update report title based on filters
function updateReportTitle(reportType, reportClass, reportSubject, reportTerm) {
    const titleElement = document.getElementById('reportTitle');
    if (!titleElement) return;
    
    let title = '';
    switch (reportType) {
        case 'attendance':
            title = 'Attendance Report';
            break;
        case 'assignment':
            title = 'Assignment Marks Report';
            break;
        case 'termtest':
            title = 'Term Test Marks Report';
            break;
        case 'overall':
            title = 'Overall Performance Report';
            break;
        default:
            title = 'Attendance Report';
    }
    
    // Add filters to title
    if (reportClass) title += ` - Class ${reportClass}`;
    if (reportSubject) title += ` - ${reportSubject}`;
    if (reportTerm) {
        const termNames = { first: 'First Term', second: 'Second Term', third: 'Third Term' };
        title += ` - ${termNames[reportTerm]}`;
    }
    
    titleElement.textContent = title;
}

// Generate attendance report
function generateAttendanceReport(classFilter) {
    const filteredStudents = classFilter ? 
        students.filter(s => s.class === classFilter) : 
        students;
    
    if (filteredStudents.length === 0) {
        return '<p class="text-muted">No students found for the selected criteria.</p>';
    }
    
    const daysHeld = calculateDaysHeld();
    const totalPossibleAttendance = filteredStudents.length * daysHeld;
    let totalPresent = 0;
    
    const reportData = filteredStudents.map(student => {
        const stats = calculateStudentAttendance(student.id);
        totalPresent += stats.present;
        return {
            ...student,
            ...stats
        };
    });
    
    const overallPercentage = totalPossibleAttendance > 0 ? 
        Math.round((totalPresent / totalPossibleAttendance) * 100) : 0;
    
    return `
        <div class="report-summary">
            <div class="summary-stats">
                <div class="summary-stat">
                    <div class="stat-value">${filteredStudents.length}</div>
                    <div class="stat-label">Total Students</div>
                </div>
                <div class="summary-stat">
                    <div class="stat-value">${daysHeld}</div>
                    <div class="stat-label">Days Conducted</div>
                </div>
                <div class="summary-stat">
                    <div class="stat-value">${overallPercentage}%</div>
                    <div class="stat-label">Overall Attendance</div>
                </div>
            </div>
        </div>
        
        <div class="report-table-container">
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Student Name</th>
                        <th>Class</th>
                        <th>Present Days</th>
                        <th>Absent Days</th>
                        <th>Attendance %</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${reportData.map(student => {
                        const statusClass = student.percentage >= 75 ? 'excellent' : 
                                          student.percentage >= 65 ? 'good' : 
                                          student.percentage >= 50 ? 'average' : 'poor';
                        const statusText = student.percentage >= 75 ? 'Excellent' : 
                                         student.percentage >= 65 ? 'Good' : 
                                         student.percentage >= 50 ? 'Average' : 'Poor';
                        
                        return `
                            <tr>
                                <td>${student.studentId}</td>
                                <td class="student-name">${student.name}</td>
                                <td>${student.class}</td>
                                <td>${student.present}</td>
                                <td>${student.absent}</td>
                                <td class="${statusClass}">${student.percentage}%</td>
                                <td class="status-${statusClass}">${statusText}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Generate assignment report
function generateAssignmentReport(classFilter, subjectFilter, termFilter) {
    let filteredStudents = classFilter ? 
        students.filter(s => s.class === classFilter) : 
        students;
    
    if (filteredStudents.length === 0) {
        return '<p class="text-muted">No students found for the selected criteria.</p>';
    }
    
    const reportData = filteredStudents.map(student => {
        let assignmentRecords = academicRecords.filter(record => 
            record.studentId === student.id && record.type === 'assignment'
        );
        
        if (subjectFilter) {
            assignmentRecords = assignmentRecords.filter(record => record.subject === subjectFilter);
        }
        if (termFilter) {
            assignmentRecords = assignmentRecords.filter(record => record.term === termFilter);
        }
        
        const assignments = [1, 2, 3, 4, 5].map(num => {
            const assignment = assignmentRecords.find(record => 
                record.assignmentNumber === num.toString()
            );
            return assignment ? assignment.marks : 0;
        });
        
        const validMarks = assignments.filter(mark => mark > 0);
        const total = validMarks.reduce((sum, mark) => sum + mark, 0);
        const average = validMarks.length > 0 ? Math.round((total / validMarks.length) * 5) : 0;
        const grade = validMarks.length > 0 ? calculateGrade(average) : '-';
        
        return {
            ...student,
            assignments,
            total,
            average,
            grade
        };
    });
    
    const classAverage = reportData.length > 0 ? 
        Math.round(reportData.reduce((sum, student) => sum + student.average, 0) / reportData.length) : 0;
    
    return `
        <div class="report-summary">
            <div class="summary-stats">
                <div class="summary-stat">
                    <div class="stat-value">${filteredStudents.length}</div>
                    <div class="stat-label">Total Students</div>
                </div>
                <div class="summary-stat">
                    <div class="stat-value">${classAverage}%</div>
                    <div class="stat-label">Class Average</div>
                </div>
                <div class="summary-stat">
                    <div class="stat-value">${subjectFilter || currentTeacher?.subject || 'All Subjects'}</div>
                    <div class="stat-label">Subject</div>
                </div>
            </div>
        </div>
        
        <div class="report-table-container">
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Student Name</th>
                        <th>Class</th>
                        <th>Asg.1</th>
                        <th>Asg.2</th>
                        <th>Asg.3</th>
                        <th>Asg.4</th>
                        <th>Asg.5</th>
                        <th>Total</th>
                        <th>Average</th>
                        <th>Grade</th>
                    </tr>
                </thead>
                <tbody>
                    ${reportData.map(student => `
                        <tr>
                            <td>${student.studentId}</td>
                            <td class="student-name">${student.name}</td>
                            <td>${student.class}</td>
                            <td>${student.assignments[0] || '-'}</td>
                            <td>${student.assignments[1] || '-'}</td>
                            <td>${student.assignments[2] || '-'}</td>
                            <td>${student.assignments[3] || '-'}</td>
                            <td>${student.assignments[4] || '-'}</td>
                            <td>${student.total}</td>
                            <td>${student.average}%</td>
                            <td class="grade-${student.grade.toLowerCase()}">${student.grade}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Generate term test report
function generateTermTestReport(classFilter, subjectFilter) {
    let filteredStudents = classFilter ? 
        students.filter(s => s.class === classFilter) : 
        students;
    
    if (filteredStudents.length === 0) {
        return '<p class="text-muted">No students found for the selected criteria.</p>';
    }
    
    const reportData = filteredStudents.map(student => {
        let termTestRecords = academicRecords.filter(record => 
            record.studentId === student.id && record.type === 'termtest'
        );
        
        if (subjectFilter) {
            termTestRecords = termTestRecords.filter(record => record.subject === subjectFilter);
        }
        
        const firstTerm = termTestRecords.find(record => record.term === 'first');
        const secondTerm = termTestRecords.find(record => record.term === 'second');
        const thirdTerm = termTestRecords.find(record => record.term === 'third');
        
        const firstMarks = firstTerm ? firstTerm.marks : 0;
        const secondMarks = secondTerm ? secondTerm.marks : 0;
        const thirdMarks = thirdTerm ? thirdTerm.marks : 0;
        
        const validMarks = [firstMarks, secondMarks, thirdMarks].filter(mark => mark > 0);
        const average = validMarks.length > 0 ? Math.round(validMarks.reduce((sum, mark) => sum + mark, 0) / validMarks.length) : 0;
        const grade = calculateGrade(average);
        
        return {
            ...student,
            firstMarks,
            secondMarks,
            thirdMarks,
            average,
            grade
        };
    });
    
    const classAverage = reportData.length > 0 ? 
        Math.round(reportData.reduce((sum, student) => sum + student.average, 0) / reportData.length) : 0;
    
    return `
        <div class="report-summary">
            <div class="summary-stats">
                <div class="summary-stat">
                    <div class="stat-value">${filteredStudents.length}</div>
                    <div class="stat-label">Total Students</div>
                </div>
                <div class="summary-stat">
                    <div class="stat-value">${classAverage}%</div>
                    <div class="stat-label">Class Average</div>
                </div>
                <div class="summary-stat">
                    <div class="stat-value">${subjectFilter || currentTeacher?.subject || 'All Subjects'}</div>
                    <div class="stat-label">Subject</div>
                </div>
            </div>
        </div>
        
        <div class="report-table-container">
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Student Name</th>
                        <th>Class</th>
                        <th>First Term</th>
                        <th>Second Term</th>
                        <th>Third Term</th>
                        <th>Average</th>
                        <th>Grade</th>
                    </tr>
                </thead>
                <tbody>
                    ${reportData.map(student => `
                        <tr>
                            <td>${student.studentId}</td>
                            <td class="student-name">${student.name}</td>
                            <td>${student.class}</td>
                            <td>${student.firstMarks || '-'}</td>
                            <td>${student.secondMarks || '-'}</td>
                            <td>${student.thirdMarks || '-'}</td>
                            <td>${student.average}%</td>
                            <td class="grade-${student.grade.toLowerCase()}">${student.grade}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Generate overall performance report
function generateOverallReport(classFilter, subjectFilter) {
    let filteredStudents = classFilter ? 
        students.filter(s => s.class === classFilter) : 
        students;
    
    if (filteredStudents.length === 0) {
        return '<p class="text-muted">No students found for the selected criteria.</p>';
    }
    
    const reportData = filteredStudents.map(student => {
        const attendanceStats = calculateStudentAttendance(student.id);
        const academicStats = calculateStudentAcademics(student.id);
        const overallPerformance = calculateOverallPerformance(student.id);
        
        return {
            ...student,
            attendancePercentage: attendanceStats.percentage,
            assignmentAvg: academicStats.assignmentAvg,
            termtestAvg: academicStats.termtestAvg,
            overallScore: overallPerformance.score,
            overallLevel: overallPerformance.level
        };
    });
    
    const classOverallAvg = reportData.length > 0 ? 
        Math.round(reportData.reduce((sum, student) => sum + student.overallScore, 0) / reportData.length) : 0;
    
    return `
        <div class="report-summary">
            <div class="summary-stats">
                <div class="summary-stat">
                    <div class="stat-value">${filteredStudents.length}</div>
                    <div class="stat-label">Total Students</div>
                </div>
                <div class="summary-stat">
                    <div class="stat-value">${classOverallAvg}%</div>
                    <div class="stat-label">Class Average</div>
                </div>
                <div class="summary-stat">
                    <div class="stat-value">${reportData.filter(s => s.overallLevel === 'Excellent').length}</div>
                    <div class="stat-label">Excellent Students</div>
                </div>
            </div>
        </div>
        
        <div class="report-table-container">
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Student Name</th>
                        <th>Class</th>
                        <th>Attendance %</th>
                        <th>Assignment Avg</th>
                        <th>Term Test Avg</th>
                        <th>Overall Score</th>
                        <th>Performance Level</th>
                    </tr>
                </thead>
                <tbody>
                    ${reportData.map(student => {
                        const levelClass = student.overallLevel.toLowerCase();
                        return `
                            <tr>
                                <td>${student.studentId}</td>
                                <td class="student-name">${student.name}</td>
                                <td>${student.class}</td>
                                <td>${student.attendancePercentage}%</td>
                                <td>${student.assignmentAvg}</td>
                                <td>${student.termtestAvg}</td>
                                <td>${student.overallScore}%</td>
                                <td class="performance-${levelClass}">${student.overallLevel}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Print report functionality
function printReport() {
    const reportContent = document.getElementById('dynamicReport').innerHTML;
    const reportTitle = document.getElementById('reportTitle').textContent;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${reportTitle}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #333; text-align: center; margin-bottom: 30px; }
                .report-summary { margin-bottom: 30px; }
                .summary-stats { display: flex; justify-content: space-around; margin-bottom: 20px; }
                .summary-stat { text-align: center; }
                .stat-value { font-size: 24px; font-weight: bold; color: #4f46e5; }
                .stat-label { font-size: 14px; color: #666; margin-top: 5px; }
                .report-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                .report-table th, .report-table td { border: 1px solid #ddd; padding: 8px; text-align: center; }
                .report-table th { background-color: #f5f5f5; font-weight: bold; }
                .excellent { color: #059669; font-weight: bold; }
                .good { color: #2563eb; font-weight: bold; }
                .average { color: #d97706; font-weight: bold; }
                .poor { color: #dc2626; font-weight: bold; }
                .grade-a { background-color: #dcfce7; color: #166534; }
                .grade-b { background-color: #dbeafe; color: #1e40af; }
                .grade-c { background-color: #fef3c7; color: #92400e; }
                .grade-d { background-color: #fed7aa; color: #c2410c; }
                .grade-f { background-color: #fee2e2; color: #dc2626; }
                .performance-excellent { color: #059669; font-weight: bold; }
                .performance-good { color: #2563eb; font-weight: bold; }
                .performance-average { color: #d97706; font-weight: bold; }
                .performance-poor { color: #dc2626; font-weight: bold; }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <h1>${reportTitle}</h1>
            <p style="text-align: center; color: #666; margin-bottom: 30px;">
                Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
            </p>
            ${reportContent}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}
