/**
 * UniHackathon Multi-Project Seed Script
 * Resets and populates clean, realistic initial seed data for all 5 SQLite databases.
 * Usage: node tests/seed-all.js [--reset]
 */
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const ROOT_DIR = path.resolve(__dirname, '..');

function seedAll() {
  console.log('======================================================================');
  console.log('🌱 KHỞI TẠO & NẠP DỮ LIỆU MẪU CHUẨN (CLEAN SEED DATA) CHO 5 DỰ ÁN');
  console.log('======================================================================\n');

  // --- 1. CocSafe (01-CocSafe) ---
  console.log('📦 [1] Đang nạp dữ liệu mẫu cho 01-CocSafe...');
  const cocDb = new DatabaseSync(path.join(ROOT_DIR, '01-CocSafe', 'backend', 'data', 'cocsafe.sqlite'));
  cocDb.exec('PRAGMA journal_mode = WAL;');
  cocDb.exec('DELETE FROM audit_logs;');
  cocDb.exec('DELETE FROM deals;');

  const insertCoc = cocDb.prepare(`
    INSERT INTO deals (id, room_address, deposit_amount, duration_months, tenant_name, tenant_wallet, landlord_name, landlord_wallet, condition_hash, state, tx_hash, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertCoc.run(
    1,
    'Phòng 302, 184 Lê Duẩn, Q. Thanh Khê, TP. Đà Nẵng',
    3.5,
    12,
    'Trần Hoàng Nam (SV ĐH Bách Khoa)',
    '0x88F9A1029c7b8C8921aA31139e8B1014311388F9',
    'Bác Nguyễn Văn Hùng',
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    '0xa4f89d873bc01b44d32a9e223f810143113cda91bb78a29910c239401ab982c1',
    'ACTIVE',
    '0x992b8c91a43113bbfa8910234123ce88421bca90123f8812cba10243113941ab',
    Date.now() - 15 * 86400000
  );

  insertCoc.run(
    2,
    'Nhà trọ KTX Mễ Trì, Ngõ 182 Lương Thế Vinh, Thanh Xuân, Hà Nội',
    2.0,
    6,
    'Lê Thu Trang (SV ĐH Quốc Gia)',
    '0x88F9A1029c7b8C8921aA31139e8B1014311388F9',
    'Cô Mai Lan',
    '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    '0xc792efb1192d3b2847a987103f43113a102948bb91aa01248102391024bbca91',
    'PENDING_REFUND',
    '0x551029ab10243113cba99102341ba09123fe12048912ba09123849102410a9bb',
    Date.now() - 25 * 86400000
  );

  cocDb.prepare(`
    INSERT INTO audit_logs (deal_id, action, actor, details, block_timestamp, tx_hash)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    1,
    'CREATE_DEAL_LOCKED',
    'Tenant',
    'Khóa cọc 3.5 AVAX với hợp đồng thuê 12 tháng',
    Date.now() - 15 * 86400000,
    '0x992b8c91a43113bbfa8910234123ce88421bca90123f8812cba10243113941ab'
  );
  console.log('  ✓ 01-CocSafe: Khởi tạo 2 hợp đồng mẫu và 1 audit log sạch.');

  // --- 2. BaoMua (02-BaoMua) ---
  console.log('📦 [2] Đang nạp dữ liệu mẫu cho 02-BaoMua...');
  const baoDb = new DatabaseSync(path.join(ROOT_DIR, '02-BaoMua', 'backend', 'data', 'baomua.sqlite'));
  baoDb.exec('PRAGMA journal_mode = WAL;');
  baoDb.exec('DELETE FROM weather_logs;');
  baoDb.exec('DELETE FROM policies;');

  const insertBao = baoDb.prepare(`
    INSERT INTO policies (id, policy_code, farmer_name, farmer_wallet, region_name, crop_type, threshold_mm, payout_amount, premium_paid, status, tx_hash, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertBao.run(
    1,
    'POL-MKG-01',
    'Bác Ba Đạt (Cần Thơ)',
    '0x88F9A1029c7b8C8921aA31139e8B1014311388F9',
    'Cần Thơ — Ô Môn',
    'Lúa Đông Xuân',
    120.0,
    5.0,
    0.5,
    'ACTIVE',
    '0x71a9e3b143113889102391024102948bb91aa01248102391024bbca912384a91',
    Date.now() - 5 * 86400000
  );

  insertBao.run(
    2,
    'POL-MKG-02',
    'Chú Năm Rạng (An Giang)',
    '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    'An Giang — Tri Tôn',
    'Lúa Nếp Xuất Khẩu',
    120.0,
    7.5,
    0.75,
    'ACTIVE',
    '0x992b8c91a43113bbfa8910234123ce88421bca90123f8812cba10243113941ab',
    Date.now() - 3 * 86400000
  );
  console.log('  ✓ 02-BaoMua: Khởi tạo 2 chính sách bảo hiểm nông dân ACTIVE.');

  // --- 3. TramXanh (03-TramXanh) ---
  console.log('📦 [3] Đang nạp dữ liệu mẫu cho 03-TramXanh...');
  const tramDb = new DatabaseSync(path.join(ROOT_DIR, '03-TramXanh', 'backend', 'data', 'tramxanh.sqlite'));
  tramDb.exec('PRAGMA journal_mode = WAL;');
  tramDb.exec('DELETE FROM certificates;');
  tramDb.exec('DELETE FROM actions;');

  const insertTram = tramDb.prepare(`
    INSERT INTO actions (id, action_type, partner_name, co2_kg, user_wallet, tx_hash, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertTram.run(
    1,
    'Ly tái sử dụng (Bình giữ nhiệt)',
    'Highlands Coffee Bách Khoa',
    0.05,
    '0x88F9A1029c7b8C8921aA31139e8B1014311388F9',
    '0x12a9efb1192d3b2847a987103f43113a102948bb91aa01248102391024bbca91',
    Date.now() - 3600000
  );

  insertTram.run(
    2,
    'Phân loại rác điện tử',
    'Trạm Xanh Hub KTX Khu A',
    0.50,
    '0x88F9A1029c7b8C8921aA31139e8B1014311388F9',
    '0x99fe8c91a43113bbfa8910234123ce88421bca90123f8812cba10243113941ab',
    Date.now() - 86400000
  );
  console.log('  ✓ 03-TramXanh: Khởi tạo 2 hành động xanh mẫu.');

  // --- 4. ThuocThat (04-ThuocThat) ---
  console.log('📦 [4] Đang nạp dữ liệu mẫu cho 04-ThuocThat...');
  const thuocDb = new DatabaseSync(path.join(ROOT_DIR, '04-ThuocThat', 'backend', 'data', 'thuocthat.sqlite'));
  thuocDb.exec('PRAGMA journal_mode = WAL;');
  thuocDb.exec('DELETE FROM scan_logs;');
  thuocDb.exec('DELETE FROM batches;');

  thuocDb.prepare(`
    INSERT INTO batches (id, batch_code, drug_name, merkle_root, manufacturer, units_count, status, tx_hash, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    1,
    'BATCH-DHG-01',
    'Augmentin 1g Kháng Sinh',
    '0x7a29ef110b4311384cca91bb78a29910c239401ab982c1a4f89d873bc01b44d3',
    'Dược Hậu Giang Pharma',
    10000,
    'Đang Phân Phối',
    '0x81b49c91a43113bbfa8910234123ce88421bca90123f8812cba10243113941ab',
    Date.now() - 10 * 86400000
  );
  console.log('  ✓ 04-ThuocThat: Khởi tạo 1 lô thuốc chuẩn Merkle Root và xóa sạch scan_logs test.');

  // --- 5. TienKhoaTen (05-TienKhoaTen) ---
  console.log('📦 [5] Đang nạp dữ liệu mẫu cho 05-TienKhoaTen...');
  const tienDb = new DatabaseSync(path.join(ROOT_DIR, '05-TienKhoaTen', 'backend', 'data', 'tienkhoaten.sqlite'));
  tienDb.exec('PRAGMA journal_mode = WAL;');
  tienDb.exec('DELETE FROM milestones;');
  tienDb.exec('DELETE FROM grants;');

  tienDb.prepare(`
    INSERT INTO grants (id, grant_name, donor_name, student_name, total_fund, disbursed_fund, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    1,
    'Học bổng Ươm Mầm Tài Năng K21',
    'Tập đoàn Công nghệ SunCloud',
    'Nguyễn Văn An (MSSV: 20210492)',
    10.0,
    3.0,
    'ACTIVE',
    Date.now() - 30 * 86400000
  );

  const insMilestone = tienDb.prepare(`
    INSERT INTO milestones (id, grant_id, milestone_index, title, amount, proof_description, is_released, tx_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insMilestone.run(1, 1, 1, 'Mốc 1: Nhập học kỳ I', 3.0, 'Giấy báo nhập học ĐH', 1, '0x892a0912384a91a4311388f9102391024102948bb91aa01248102391024bbca9');
  insMilestone.run(2, 1, 2, 'Mốc 2: GPA Kỳ I đạt >= 3.2', 3.0, 'Bảng điểm GPA 3.6 (Băm SHA-256)', 0, null);
  insMilestone.run(3, 1, 3, 'Mốc 3: Hoàn thành Khóa Luận Tốt Nghiệp', 4.0, 'Chứng chỉ ngoại ngữ & Khóa luận', 0, null);
  console.log('  ✓ 05-TienKhoaTen: Khôi phục quỹ học bổng về 3.0/10.0 AVAX (Mốc 2 & Mốc 3 chưa giải ngân, sẵn sàng demo).');

  console.log('\n======================================================================');
  console.log('🎉 TẤT CẢ 5 CƠ SỞ DỮ LIỆU ĐÃ ĐƯỢC RESET VỀ TRẠNG THÁI MẪU SẠCH SẼ 100%!');
  console.log('======================================================================');
}

seedAll();
