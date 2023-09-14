## 初始化
### Initialize
```
npm install
```

### 設定 .env
1. 將.env.example 複製一份為 .env，並設定相關參數
2. 在終端機輸入以下字串，製作種子資料

```bash
npm run seed
```

3. 安裝完成後，輸入：

```bash
npm run dev
```


## 共用帳號
* 第一組 user 帳號 
  * email: user1@example.com
  * password: 12345678
* 第二組 user 帳號
  * email: user2@example.com
  * password: 12345678
* 第三組 user 帳號
  * email: user3@example.com
  * password: 12345678

* 第一組 admin 帳號
  * email: root@example.com
  * password: 12345678

## 功能
* 未登入
  * 首頁
    * 使用者可以註冊及登入帳號
    * 使用者可以透過 Google Login 直接登入，若已用信箱註冊，就會取得帳號紀錄
    * 使用者可以切換到 admin 頁面登入

* 登入後
  * 首頁
    * 使用者可以進入個人頁面
    * 使用者若非老師，可以填寫資料成為老師
    * 使用者若是老師，可以看到老師頁面的入口
    * 使用者可以登出
    * 使用者可以在瀏覽所有老師
    * 使用者可以在搜尋老師姓名或資訊
    * 使用者可以在首頁瀏覽使用者上課前十名的學習時數

  * 個人頁面
    * 使用者可以瀏覽自己的個人資料
    * 使用者可以編輯自己的個人資料
    * 使用者可以瀏覽自己的課程
    * 使用者可以瀏覽未評價的課程

  * 老師頁面
    * 使用者可以在老師頁面瀏覽老師的詳細資訊
    * 使用者可以在老師頁面瀏覽老師的評價
    * 使用者可以在老師頁面瀏覽老師兩週內可預約的課程

  * Admin
    * 使用者可以在 admin 頁面瀏覽所有使用者
