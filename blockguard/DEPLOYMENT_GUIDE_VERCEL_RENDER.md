# 🚀 Hướng Dẫn Triển Khai Production (Vercel + Render + Avalanche Fuji)
## BlockGuard — Trợ Lý Bảo Mật Hợp Đồng Thông Minh AI & Đăng Ký Minh Chứng On-Chain

Tài liệu này cung cấp hướng dẫn từng bước chuẩn chỉnh để triển khai toàn bộ hệ thống BlockGuard lên môi trường Production thực tế:
- **Frontend SPA:** Triển khai lên **Vercel** (Global Edge CDN, tự động HTTPS, rewrites cho SPA).
- **Backend API & Scanner:** Triển khai lên **Render** dưới dạng **Docker Web Service** gắn kèm **Persistent Disk** (bảo toàn SQLite database `blockguard.db` và log files vĩnh viễn khi restart/redeploy).
- **Smart Contract:** Triển khai lên mạng **Avalanche Fuji Testnet** (Chain ID: `43113`).

---

## 🏛️ Kiến Trúc Hệ Thống Production

```
+-----------------------------------------------------------------------------------+
|                                 USER BROWSER                                      |
|            + MetaMask / Core Wallet (Mạng Avalanche Fuji Chain ID 43113)          |
+-----------------------------------------------------------------------------------+
        |                                                           |
   (HTTPS / WSS)                                            (Web3 RPC eth_sendRawTx)
        |                                                           |
        v                                                           v
+-------------------------------+                       +-------------------------+
|        VERCEL (EDGE)          |                       |   AVALANCHE FUJI C-CHAIN|
| - React 18 + TypeScript + Vite|                       | - AuditRegistry.sol     |
| - Tailwind CSS Dark Theme     |                       | - Immutable keccak256   |
| - VITE_API_URL trỏ về Render  |                       |   Source & Report Proof |
+-------------------------------+                       | - Snowtrace Explorer    |
        |                                               +-------------------------+
    (REST API)                                                      ^
        |                                                           |
        v                                                           |
+-----------------------------------------------------------+       |
|                     RENDER WEB SERVICE                    |       |
| - Docker Container (Node.js 20 LTS Alpine)                |       |
| - Express + TypeScript Pure Static AST Engine             |-------+ (Read-only View)
| - Helmet Hardening (no-referrer, nosniff, SAMEORIGIN)     |
| - SQLite Engine (better-sqlite3 + WAL Mode)               |
|                                                           |
| [PERSISTENT DISK MOUNT: /app/data & /app/logs]            |
|   +-- blockguard.db (Lưu trữ Audits, Findings vĩnh viễn)   |
|   +-- access.log & security.log (Audit trail bảo mật)     |
+-----------------------------------------------------------+
```

---

## 📦 PHẦN 1: Triển Khai Smart Contract Lên Avalanche Fuji Testnet

### Bước 1: Nhận AVAX Testnet Miễn Phí
1. Mở ví **MetaMask** hoặc **Core Wallet**.
2. Thêm mạng **Avalanche Fuji Testnet**:
   - **Network Name:** Avalanche Fuji C-Chain
   - **New RPC URL:** `https://api.avax-test.network/ext/bc/C/rpc`
   - **Chain ID:** `43113`
   - **Currency Symbol:** `AVAX`
   - **Explorer:** `https://testnet.snowtrace.io/`
3. Truy cập [Avalanche Testnet Faucet](https://core.app/tools/testnet-faucet/) hoặc [Chainlink Faucet](https://faucets.chain.link/fuji) và yêu cầu nhận 2 AVAX vào địa chỉ ví của bạn.

### Bước 2: Cấu Hình File Môi Trường
Tại thư mục gốc `blockguard/`, tạo hoặc chỉnh sửa file `.env`:
```env
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
FUJI_PRIVATE_KEY=0x<PRIVATE_KEY_VÍ_CỦA_BẠN>
SNOWTRACE_API_KEY=<TÙY_CHỌN_ĐỂ_VERIFY_CONTRACT>
```
> ⚠️ **CẢNH BÁO AN TOÀN:** Tuyệt đối không commit file `.env` chứa Private Key lên GitHub. File `.gitignore` đã được cấu hình chặn file `.env`.

### Bước 3: Biên Dịch & Triển Khai Hợp Đồng
Mở terminal và thực thi các lệnh:
```bash
# Di chuyển vào thư mục dự án
cd "d:/To Do/UniHackathon/blockguard"

# Biên dịch hợp đồng tối ưu hóa Gas
npx hardhat compile

# Triển khai lên Avalanche Fuji
npx hardhat run scripts/deploy.ts --network fuji
```

Sau khi deploy thành công, terminal sẽ in ra:
```
======================================================
🚀 Deploying AuditRegistry to Avalanche Fuji (Chain ID: 43113)...
Deployer address: 0xYourWalletAddress
AuditRegistry deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
======================================================
```
👉 **LƯU LẠI ĐỊA CHỈ CONTRACT NÀY** để cấu hình cho Backend và Frontend.

---

## 🖥️ PHẦN 2: Triển Khai Backend Lên Render (Docker + Persistent Disk)

Render hỗ trợ Docker và cho phép gắn ổ cứng cố định (**Persistent Disk**) giúp SQLite database không bị reset khi server khởi động lại.

### Bước 1: Chuẩn Bị Kho Mã Nguồn GitHub
Đẩy mã nguồn thư mục `blockguard/` lên kho lưu trữ GitHub của bạn:
```bash
git add .
git commit -m "feat: production ready with persistent sqlite, url hardening & dockerfile"
git push origin main
```

### Bước 2: Tạo Web Service Trên Render Dashboard
1. Truy cập [Render Dashboard](https://dashboard.render.com/) và bấm **New +** -> **Web Service**.
2. Kết nối tài khoản GitHub và chọn kho mã nguồn của bạn.
3. Cấu hình dịch vụ:
   - **Name:** `blockguard-backend` (hoặc tên tùy chọn)
   - **Region:** `Singapore` hoặc `Frankfurt` (khuyến nghị Singapore cho độ trễ thấp nhất tại VN)
   - **Language:** **Docker**
   - **Root Directory:** `blockguard/backend`
   - **Dockerfile Path:** `./Dockerfile`
   - **Instance Type:** `Free` hoặc `Starter`

### Bước 3: Gắn Ổ Cứng Cố Định (Persistent Disk) — BẮT BUỘC CHO SQLITE
1. Trong màn hình cấu hình Web Service, kéo xuống mục **Disks** -> Bấm **Add Disk**.
2. Nhập các thông số:
   - **Name:** `blockguard-disk`
   - **Mount Path:** `/app/data`
   - **Size:** `1 GB` (hoặc lớn hơn tùy nhu cầu)
3. Thao tác này đảm bảo file SQLite `blockguard.db` được bảo toàn 100% qua mọi lần restart, redeploy hay sleep của server.

### Bước 4: Thiết Lập Biến Môi Trường (Environment Variables)
Tại tab **Environment**, thêm các biến sau:
| Key | Value | Ghi chú |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Bật chế độ production |
| `PORT` | `3001` | Cổng dịch vụ |
| `DATA_DIR` | `/app/data` | Đường dẫn thư mục database trên Disk |
| `LOG_DIR` | `/app/data/logs` | Đường dẫn lưu trữ log trên Disk |
| `CORS_ORIGIN` | `https://<ten-ung-dung-cua-ban>.vercel.app` | Cho phép Vercel gọi API |
| `FUJI_RPC_URL` | `https://api.avax-test.network/ext/bc/C/rpc` | RPC Avalanche Fuji |
| `REGISTRY_CONTRACT_ADDRESS` | `0x...` *(Địa chỉ lấy từ Phần 1)* | Hợp đồng AuditRegistry |

Bấm **Create Web Service**. Khi triển khai hoàn tất, Render sẽ cấp cho bạn đường dẫn URL công khai, ví dụ:
`https://blockguard-backend.onrender.com`

Kiểm tra sức khỏe dịch vụ bằng trình duyệt:
`https://blockguard-backend.onrender.com/health` -> Phải trả về:
```json
{"status":"UP","timestamp":"...","uptime":...,"engine":"Pure Static AST Scanner (Zero-Execution)"}
```

---

## 🌐 PHẦN 3: Triển Khai Frontend Lên Vercel

### Bước 1: Kiểm Tra Cấu Hình Vercel Rewrite
Dự án đã có sẵn file `blockguard/frontend/vercel.json` với nội dung chuẩn hóa SPA Routing:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Bước 2: Import Dự Án Lên Vercel
1. Truy cập [Vercel Dashboard](https://vercel.com/) và bấm **Add New...** -> **Project**.
2. Chọn repository GitHub chứa dự án BlockGuard.
3. Cấu hình cài đặt dự án:
   - **Project Name:** `blockguard`
   - **Framework Preset:** **Vite**
   - **Root Directory:** Bấm **Edit** và chọn `blockguard/frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Bước 3: Cấu Hình Biến Môi Trường Cho Frontend
Tại mục **Environment Variables**, thêm các biến sau:
| Key | Value | Ghi chú |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://blockguard-backend.onrender.com` | **URL Backend trên Render từ Phần 2** |
| `VITE_FUJI_CHAIN_ID` | `43113` | Chain ID Avalanche Fuji |
| `VITE_REGISTRY_ADDRESS` | `0x...` | Địa chỉ contract từ Phần 1 |

4. Bấm **Deploy**. Vercel sẽ tự động build và tạo domain HTTPS miễn phí, ví dụ:
`https://blockguard.vercel.app`

---

## 🔒 PHẦN 4: Bảng Kiểm Định Bảo Mật & Xác Thực (Smoke Test Checklist)

Sau khi deploy xong, hãy kiểm tra danh sách sau để đảm bảo hệ thống vận hành đúng chuẩn SaaS:

| STT | Hạng mục kiểm tra | Thao tác thực tế | Kết quả mong đợi |
| :---: | :--- | :--- | :--- |
| **1** | **Loại Bỏ Fallback Mock** | Mở DevTools Network tab, submit audit hợp đồng mới. | Request gọi trực tiếp `POST /api/audits` trên Render (HTTP 201), dữ liệu trả về từ SQLite, không còn bất kỳ fallback hay fake data nào. |
| **2** | **Bảo Mật URL & Referrer** | Kiểm tra Response Headers của mọi request. | Có Header `Referrer-Policy: no-referrer` và `<meta name="referrer" content="no-referrer">`. URL không bị rò rỉ token hay tham số query. |
| **3** | **Chống SQLi & Path Traversal** | Gửi request `GET /api/audits/..%2f..%2fwin.ini` | Trả về HTTP 400 cùng cảnh báo `Security alert: Invalid audit identifier format`. |
| **4** | **Chống Tấn Công DoS** | Gửi payload hợp đồng > 2MB | Backend chặn ngay lập tức với HTTP 413 (Payload Too Large). |
| **5** | **Tính Bất Biến Keccak256** | So sánh hash mã nguồn và hash báo cáo giữa Frontend và Backend. | Hai giá trị Keccak-256 khớp nhau 100% theo chuẩn 32-byte bytes32 của Ethereum/Avalanche. |
| **6** | **Tương Tác On-Chain Thật** | Kết nối ví MetaMask, bấm "Register on Avalanche Fuji". | MetaMask bung pop-up yêu cầu ký transaction trên Fuji C-Chain, sau khi confirm xuất hiện link xem trực tiếp trên Snowtrace Explorer. |
| **7** | **Khả Năng Lưu Trữ DB Bền Vững** | Khởi động lại (Restart Service) trên Render, sau đó reload trang Dashboard. | Danh sách tất cả các audit trước đó vẫn nguyên vẹn nhờ Render Persistent Disk. |

---

## 🛠️ Xử Lý Sự Cố Thường Gặp (Troubleshooting)

### 1. Lỗi CORS khi Frontend gọi Backend:
- **Hiện tượng:** Trình duyệt báo `Access to XMLHttpRequest at '...' from origin '...' has been blocked by CORS policy`.
- **Cách khắc phục:** Vào Render -> Environment, kiểm tra giá trị `CORS_ORIGIN` đã nhập đúng domain Vercel (bao gồm cả `https://`, không có dấu gạch chéo `/` ở cuối) hay chưa. Khởi động lại service sau khi đổi.

### 2. MetaMask Báo Sai Mạng Khi Đăng Ký:
- **Hiện tượng:** Nút đăng ký on-chain báo lỗi sai mạng.
- **Cách khắc phục:** Đảm bảo MetaMask của bạn đã chuyển sang mạng **Avalanche Fuji Testnet** (Chain ID `43113`).

### 3. Hết Gas / Faucet Không Hoạt Động:
- **Hiện tượng:** Giao dịch deploy hoặc đăng ký on-chain bị pending hoặc revert.
- **Cách khắc phục:** Kiểm tra số dư AVAX trong ví deployer hoặc ví người dùng tại `https://testnet.snowtrace.io/address/<your-wallet>`. Lấy thêm token từ các faucet dự phòng của Chainlink hoặc Avalanche.
