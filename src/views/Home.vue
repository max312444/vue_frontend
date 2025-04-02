<template>
    <div>
      <h1>회원 관절 측정 웹사이트</h1>
      <a :href="loginUrl">구글 로그인</a>
    </div>
  </template>
  
  <script setup>
  const loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=797911644709-i04iqmiuo2eggqoemn732mbcrgro7dks.apps.googleusercontent.com&redirect_uri=http://localhost:5173/oauth-callback&response_type=token&scope=https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email&prompt=consent`
  </script>
  