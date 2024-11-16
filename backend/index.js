const express = require('express');
const dotenv = require('dotenv');

// 환경 변수 설정
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// JSON 데이터를 파싱할 수 있도록 설정
app.use(express.json());

// 간단한 테스트 엔드포인트
app.get('/', (req, res) => {
  res.send('Smart Pill Backend is running');
});

// 약 정보 조회 API
app.get('/api/medicines', (req, res) => {
  // 예시 데이터 - 실제 프로젝트에서는 데이터베이스를 사용할 수 있습니다.
  const medicines = [
    { id: 1, name: 'Vitamin C', dosage: '500mg', frequency: 'daily' },
    { id: 2, name: 'Painkiller', dosage: '250mg', frequency: 'as needed' }
  ];
  res.json(medicines);
});

// 로그인 엔드포인트 (예시)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  // 실제 구현에서는 데이터베이스에서 사용자 인증을 해야 합니다.
  if (username === 'testuser' && password === 'password') {
    res.json({ message: 'Login successful', token: 'fake-jwt-token' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
