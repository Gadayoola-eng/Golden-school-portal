// Automated test suite for Student Portal REST API (Stage 2 & Stage 3)
const http = require('http');

const BASE_URL = 'http://localhost:5000';

const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests() {
  console.log('🧪 Starting API Verification Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    console.log('--- 1. Health Check ---');
    const health = await request('/api/health');
    assert(health.status === 200 && health.data.status === 'ok', 'GET /api/health returns 200 OK');

    // 2. Auth: Pre-seeded Teacher Login
    console.log('\n--- 2. Authentication & Roles ---');
    const teacherLogin = await request('/api/auth/login', 'POST', {
      email: 'teacher@portal.edu',
      password: 'password123',
    });
    assert(teacherLogin.status === 200 && teacherLogin.data.token, 'Teacher login returns JWT');
    const teacherToken = teacherLogin.data.token;
    assert(teacherLogin.data.user.role === 'TEACHER', 'Teacher role is TEACHER');

    // 3. Auth: Pre-seeded Student Login
    const studentLogin = await request('/api/auth/login', 'POST', {
      email: 'student@portal.edu',
      password: 'password123',
    });
    assert(studentLogin.status === 200 && studentLogin.data.token, 'Student login returns JWT');
    const studentToken = studentLogin.data.token;
    assert(studentLogin.data.user.role === 'STUDENT', 'Student role is STUDENT');

    // 4. Auth: Register a new student
    const testEmail = `student_${Date.now()}@portal.edu`;
    const signupRes = await request('/api/auth/signup', 'POST', {
      name: 'Jordan Belfort',
      email: testEmail,
      password: 'password123',
      role: 'STUDENT',
    });
    assert(signupRes.status === 201 && signupRes.data.user.email === testEmail, 'Signup new student returns 201');

    // 5. Auth: Verify /api/auth/me
    const meRes = await request('/api/auth/me', 'GET', null, teacherToken);
    assert(meRes.status === 200 && meRes.data.user.email === 'teacher@portal.edu', 'GET /api/auth/me returns current user');

    // 6. Role Authorization Guard check (Student attempting Teacher-only endpoint)
    console.log('\n--- 3. Role-based Middleware Guard ---');
    const forbiddenRes = await request('/api/classes', 'POST', { name: 'Unauthorized Class' }, studentToken);
    assert(forbiddenRes.status === 403, 'Student creating class is blocked with 403 Forbidden');

    const unauthRes = await request('/api/classes', 'GET');
    assert(unauthRes.status === 401, 'Request without token is blocked with 401 Unauthorized');

    // 7. Teacher Class Management
    console.log('\n--- 4. Class Operations ---');
    const createClassRes = await request('/api/classes', 'POST', {
      name: 'PHYS101: Quantum Mechanics',
      description: 'Introduction to wave functions, Schrödinger equation, and quantum states.',
    }, teacherToken);
    assert(createClassRes.status === 201 && createClassRes.data.class.id, 'Teacher creates new class returns 201');
    const newClassId = createClassRes.data.class.id;

    const teacherClasses = await request('/api/classes', 'GET', null, teacherToken);
    assert(teacherClasses.status === 200 && teacherClasses.data.classes.length >= 2, 'Teacher retrieves their class list');

    // 8. Student Enrollment
    console.log('\n--- 5. Student Enrollment ---');
    const enrollRes = await request(`/api/classes/${newClassId}/enroll`, 'POST', {}, studentToken);
    assert(enrollRes.status === 201, 'Student enrolls in new class returns 201');

    const classDetail = await request(`/api/classes/${newClassId}`, 'GET', null, teacherToken);
    assert(classDetail.status === 200 && classDetail.data.class.roster.some(s => s.email === 'student@portal.edu'), 'Class roster includes enrolled student');

    // 9. Teacher Creates Assignment
    console.log('\n--- 6. Assignment Workflows ---');
    const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
    const createAssignRes = await request('/api/assignments', 'POST', {
      classId: newClassId,
      title: 'Problem Set 1: Wave-Particle Duality',
      instructions: 'Calculate the de Broglie wavelength for an electron traveling at 2.0 x 10^6 m/s.',
      dueDate: futureDate,
      points: 100,
    }, teacherToken);
    assert(createAssignRes.status === 201 && createAssignRes.data.assignment.id, 'Teacher creates assignment returns 201');
    const assignmentId = createAssignRes.data.assignment.id;

    // 10. Student Views & Submits Assignment
    console.log('\n--- 7. Submission & Grading ---');
    const studentAssignList = await request(`/api/assignments/class/${newClassId}`, 'GET', null, studentToken);
    assert(studentAssignList.status === 200 && studentAssignList.data.assignments.length === 1, 'Student lists assignments for enrolled class');

    const submitRes = await request(`/api/submissions/assignment/${assignmentId}/submit`, 'POST', {
      textAnswer: 'Using lambda = h / (m * v), m_e = 9.109e-31 kg, lambda = 3.64 x 10^-10 meters (0.364 nm).',
    }, studentToken);
    assert(submitRes.status === 201 && submitRes.data?.submission?.id, 'Student submits assignment returns 201');
    const submissionId = submitRes.data?.submission?.id;

    // 11. Teacher views submissions for assignment
    const submissionsList = await request(`/api/submissions/assignment/${assignmentId}`, 'GET', null, teacherToken);
    assert(submissionsList.status === 200 && submissionsList.data.submissions.length >= 1, 'Teacher retrieves assignment submissions');

    // 12. Teacher grades submission
    const gradeRes = await request(`/api/submissions/${submissionId}/grade`, 'POST', {
      grade: 98,
      feedback: 'Outstanding derivation and precision in your constants.',
    }, teacherToken);
    assert(gradeRes.status === 200 && gradeRes.data.submission.grade === 98, 'Teacher grades submission with score & feedback');

    // 13. Teacher Gradebook Matrix
    console.log('\n--- 8. Gradebook Matrix & Student Grades ---');
    const gradebookRes = await request(`/api/submissions/class/${newClassId}/gradebook`, 'GET', null, teacherToken);
    assert(gradebookRes.status === 200 && gradebookRes.data.matrix.length >= 1, 'Teacher accesses class gradebook matrix');
    const studentRow = gradebookRes.data.matrix.find(m => m.student.email === 'student@portal.edu');
    assert(studentRow && studentRow.totalEarned === 98, 'Gradebook calculates student earned points accurately (98/100)');

    // 14. Student Views Class Grades
    const myGradesRes = await request(`/api/submissions/class/${newClassId}/my-grades`, 'GET', null, studentToken);
    assert(myGradesRes.status === 200 && myGradesRes.data.overallPercentage === 98, 'Student views class grade summary (98%)');

    // 15. Dashboards
    console.log('\n--- 9. Dashboards ---');
    const teacherDash = await request('/api/dashboard/teacher', 'GET', null, teacherToken);
    assert(teacherDash.status === 200 && teacherDash.data.stats.totalClasses >= 2, 'Teacher dashboard returns stats & classes');

    const studentDash = await request('/api/dashboard/student', 'GET', null, studentToken);
    assert(studentDash.status === 200 && studentDash.data.stats.enrolledClassesCount >= 2, 'Student dashboard returns upcoming assignments & grades');

    console.log(`\n🎉 Verification Complete: ${passed} passed, ${failed} failed.`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Unexpected test failure:', err);
    process.exit(1);
  }
}

runTests();
