/**
 * 认证和用户管理模块
 * 支持升级：目前用Firebase，未来可迁移到REST API
 */

const authModule = {
  // 当前用户
  currentUser: null,

  // 初始化认证监听
  init: function() {
    firebaseAuth.onAuthStateChanged((user) => {
      this.currentUser = user;
      if (user) {
        this.loadUserProfile(user.uid);
        this.showMainApp();
      } else {
        this.showAuthPage();
      }
    });
  },

  // 注册
  register: async function(email, password, username) {
    try {
      const result = await firebaseAuth.createUserWithEmailAndPassword(email, password);
      const uid = result.user.uid;

      // 创建用户资料
      await firebaseDB.collection('users').doc(uid).set({
        uid: uid,
        email: email,
        username: username,
        avatar: username.charAt(0),
        rating: 5.0,
        totalTrades: 0,
        disputes: 0,
        trustScore: 50, // 新用户初始分数
        verified: {
          identity: false,
          bank: false
        },
        avgResponseTime: 0,
        createdAt: new Date(),
        lastActive: new Date()
      });

      showToast(`欢迎 ${username}！`, 'success', 2000);
      return { success: true, user: result.user };
    } catch (error) {
      showToast(`注册失败: ${error.message}`, 'error', 3000);
      return { success: false, error };
    }
  },

  // 登入
  login: async function(email, password) {
    try {
      const result = await firebaseAuth.signInWithEmailAndPassword(email, password);
      showToast('登入成功！', 'success', 2000);
      return { success: true, user: result.user };
    } catch (error) {
      showToast(`登入失败: ${error.message}`, 'error', 3000);
      return { success: false, error };
    }
  },

  // 登出
  logout: async function() {
    try {
      await firebaseAuth.signOut();
      this.currentUser = null;
      showToast('已登出', 'info', 1500);
      return { success: true };
    } catch (error) {
      showToast('登出失败', 'error', 2000);
      return { success: false, error };
    }
  },

  // 加载用户资料
  loadUserProfile: async function(uid) {
    try {
      const doc = await firebaseDB.collection('users').doc(uid).get();
      if (doc.exists) {
        const userData = doc.data();
        localStorage.setItem('userProfile', JSON.stringify(userData));
        return userData;
      }
    } catch (error) {
      console.error('加载用户资料失败:', error);
    }
  },

  // 获取当前用户资料
  getCurrentUserProfile: function() {
    const cached = localStorage.getItem('userProfile');
    return cached ? JSON.parse(cached) : null;
  },

  // 显示认证页面
  showAuthPage: function() {
    const container = document.getElementById('app-container');
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); align-items: center; justify-content: center; padding: 1rem;">
        <div style="background: white; border-radius: 12px; padding: 2rem; width: 100%; max-width: 360px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
          <h1 style="text-align: center; color: #333; margin: 0 0 0.5rem 0;">哩程點數媒合</h1>
          <p style="text-align: center; color: #666; font-size: 0.9rem; margin: 0 0 2rem 0;">台灣首個 P2P 媒合平台</p>

          <div id="auth-container">
            <!-- 登入表单 -->
            <div id="login-form" style="display: block;">
              <input type="email" id="login-email" placeholder="Email" class="form-input" style="margin-bottom: 0.75rem;">
              <input type="password" id="login-password" placeholder="密碼" class="form-input" style="margin-bottom: 1.5rem;">
              <button onclick="authModule.handleLogin()" class="btn-primary w-full" style="margin-bottom: 1rem;">登入</button>
              <p style="text-align: center; font-size: 0.85rem; color: #666;">
                還沒有帳戶？ <a href="javascript:authModule.switchToRegister()" style="color: #667eea; text-decoration: none; cursor: pointer; font-weight: 600;">註冊</a>
              </p>
            </div>

            <!-- 注册表单 -->
            <div id="register-form" style="display: none;">
              <input type="text" id="register-username" placeholder="用戶名稱" class="form-input" style="margin-bottom: 0.75rem;">
              <input type="email" id="register-email" placeholder="Email" class="form-input" style="margin-bottom: 0.75rem;">
              <input type="password" id="register-password" placeholder="密碼" class="form-input" style="margin-bottom: 1.5rem;">
              <button onclick="authModule.handleRegister()" class="btn-primary w-full" style="margin-bottom: 1rem;">註冊</button>
              <p style="text-align: center; font-size: 0.85rem; color: #666;">
                已有帳戶？ <a href="javascript:authModule.switchToLogin()" style="color: #667eea; text-decoration: none; cursor: pointer; font-weight: 600;">登入</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 切换到注册表单
  switchToRegister: function() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
  },

  // 切换到登入表单
  switchToLogin: function() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
  },

  // 处理登入
  handleLogin: async function() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      showToast('請輸入 Email 和密碼', 'warning', 2000);
      return;
    }

    const result = await this.login(email, password);
    if (result.success) {
      // 自动跳转到主app（由onAuthStateChanged处理）
    }
  },

  // 处理注册
  handleRegister: async function() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    if (!username || !email || !password) {
      showToast('請填寫所有欄位', 'warning', 2000);
      return;
    }

    if (password.length < 6) {
      showToast('密碼至少需要 6 個字符', 'warning', 2000);
      return;
    }

    const result = await this.register(email, password, username);
    if (result.success) {
      this.switchToLogin();
      showToast('註冊成功！請登入', 'success', 2000);
    }
  },

  // 显示主应用
  showMainApp: function() {
    const container = document.getElementById('app-container');

    // 添加authenticated类来显示views
    container.classList.add('authenticated');

    // 调用app的初始化函数
    if (window.initMainApp) {
      window.initMainApp();
    } else {
      console.error('initMainApp not found');
    }
  }
};

// 初始化认证
document.addEventListener('DOMContentLoaded', () => {
  // 等待Firebase加载
  const checkFirebase = setInterval(() => {
    if (typeof firebase !== 'undefined' && window.firebaseAuth) {
      clearInterval(checkFirebase);
      authModule.init();
    }
  }, 100);
});
