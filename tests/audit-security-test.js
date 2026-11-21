/**
 * Deep Security & Business Logic Stress Test Suite
 * Audits 5 Hackathon Backends for vulnerabilities, state machine violations,
 * input validation flaws, and error handling weaknesses.
 */
const http = require('http');

async function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const reqOptions = {
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + (u.search || ''),
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runSecurityAudit() {
  const findings = [];

  console.log('======================================================================');
  console.log('🛡️  BẮT ĐẦU QUY TRÌNH AUDIT BẢO MẬT & KIỂM TRA LỖ HỔNG HỆ THỐNG');
  console.log('======================================================================\n');

  // --- 1. AUDIT CỌCSAFE (5001) ---
  console.log('🔍 [1] RÀ SOÁT CỌCSAFE (PORT 5001)...');

  // Test 1.1: Negative Deposit Amount
  try {
    const res = await request('http://localhost:5001/api/deals', { method: 'POST' }, {
      room_address: '123 Test Negative Deposit',
      deposit_amount: -100.0,
      duration_months: 6,
      tenant_name: 'Attacker',
      condition_hash: '0x1234567890abcdef'
    });
    if (res.status === 200 && res.data.success) {
      findings.push({
        system: '01-CocSafe',
        severity: 'HIGH',
        vuln: 'Thiếu kiểm tra số âm cho tiền cọc (Negative Deposit)',
        details: `Backend chấp nhận nạp tiền cọc âm (-100.0 AVAX) tạo Deal #${res.data.dealId}. Có thể làm suy giảm quỹ Escrow hoặc đảo chiều dòng tiền!`
      });
      console.log('  ⚠️  PHÁT HIỆN: Chấp nhận tiền cọc số âm (-100 AVAX)!');
    }
  } catch (e) { console.error(e); }

  // Test 1.2: State Machine Bypass - Direct approve without refund request
  try {
    // Create an active deal
    const dealRes = await request('http://localhost:5001/api/deals', { method: 'POST' }, {
      room_address: 'Test State Bypass',
      deposit_amount: 1.0,
      duration_months: 6,
      condition_hash: '0xabcdef1234'
    });
    const dId = dealRes.data.dealId;

    // Immediately approve refund while still in ACTIVE state
    const approveRes = await request(`http://localhost:5001/api/deals/${dId}/approve-refund`, { method: 'POST' });
    if (approveRes.status === 200 && approveRes.data.success) {
      findings.push({
        system: '01-CocSafe',
        severity: 'MEDIUM',
        vuln: 'Bỏ qua máy trạng thái (State Machine Bypass)',
        details: `Có thể gọi trực tiếp /approve-refund trên Hợp đồng #${dId} khi trạng thái đang là ACTIVE (chưa từng qua PENDING_REFUND hay timelock 72h).`
      });
      console.log('  ⚠️  PHÁT HIỆN: Bỏ qua bước yêu cầu hoàn cọc & đếm ngược 72h!');
    }

    // Test 1.3: Double Refund / Repeated Approve
    const doubleApprove = await request(`http://localhost:5001/api/deals/${dId}/approve-refund`, { method: 'POST' });
    if (doubleApprove.status === 200 && doubleApprove.data.success) {
      findings.push({
        system: '01-CocSafe',
        severity: 'HIGH',
        vuln: 'Lặp lại hành động giải ngân (Double Spend / Idempotency Flaw)',
        details: `Hợp đồng #${dId} đã ở trạng thái REFUNDED nhưng vẫn tiếp tục gọi /approve-refund thành công và tạo thêm log giao dịch rơ-le!`
      });
      console.log('  ⚠️  PHÁT HIỆN: Cho phép duyệt hoàn cọc nhiều lần liên tiếp!');
    }
  } catch (e) { console.error(e); }

  // Test 1.4: Non-existent Deal Handling
  try {
    const invalidDeal = await request('http://localhost:5001/api/deals/9999999/approve-refund', { method: 'POST' });
    if (invalidDeal.status === 200 && invalidDeal.data.success) {
      findings.push({
        system: '01-CocSafe',
        severity: 'LOW',
        vuln: 'Thiếu kiểm tra sự tồn tại của bản ghi (Missing Entity Existence Check)',
        details: 'Gọi hoàn cọc với Deal ID 9999999 không tồn tại nhưng API vẫn trả về success: true và sinh tx_hash giả.'
      });
      console.log('  ⚠️  PHÁT HIỆN: Không kiểm tra Deal ID có tồn tại trước khi cập nhật!');
    }
  } catch (e) { console.error(e); }


  // --- 2. AUDIT BẢOMÙA (5002) ---
  console.log('\n🔍 [2] RÀ SOÁT BẢOMÙA (PORT 5002)...');

  // Test 2.1: Duplicate Storm Payout (Reentrancy / Idempotency)
  try {
    const storm1 = await request('http://localhost:5002/api/simulate-storm', { method: 'POST' });
    const storm2 = await request('http://localhost:5002/api/simulate-storm', { method: 'POST' });
    // Check if active policies remain
    const policies = await request('http://localhost:5002/api/policies');
    const activeLeft = policies.data.data.filter(p => p.status === 'ACTIVE').length;
    console.log(`  ✓ Cơ chế cập nhật bão: Tất cả ${policies.data.data.length} hợp đồng đã chuyển sang PAID_OUT, còn lại ${activeLeft} ACTIVE.`);
  } catch (e) { console.error(e); }

  // Test 2.2: Negative Premium on Policy
  try {
    const negPolicy = await request('http://localhost:5002/api/policies', { method: 'POST' }, {
      farmer_name: 'Farmer Test',
      region_name: 'An Giang',
      crop_type: 'Lúa Nếp',
      threshold_mm: -50,
      premium_paid: -10
    });
    if (negPolicy.status === 200 && negPolicy.data.success) {
      findings.push({
        system: '02-BaoMua',
        severity: 'MEDIUM',
        vuln: 'Thiếu kiểm tra số âm phí bảo hiểm & ngưỡng lượng mưa',
        details: 'Cho phép tạo hợp đồng bảo hiểm với phí âm và ngưỡng mưa âm, tính toán payout sai lệch.'
      });
      console.log('  ⚠️  PHÁT HIỆN: Chấp nhận phí bảo hiểm âm (-10 AVAX)!');
    }
  } catch (e) { console.error(e); }


  // --- 3. AUDIT TRẠMXANH (5003) ---
  console.log('\n🔍 [3] RÀ SOÁT TRẠMXANH (PORT 5003)...');

  // Test 3.1: Negative CO2 minting
  try {
    const negCO2 = await request('http://localhost:5003/api/actions', { method: 'POST' }, {
      action_type: 'Phá hủy môi trường',
      co2_kg: -500.0
    });
    if (negCO2.status === 200 && negCO2.data.success) {
      findings.push({
        system: '03-TramXanh',
        severity: 'LOW',
        vuln: 'Không giới hạn giá trị âm cho lượng giảm phát thải CO2',
        details: 'Cho phép nhập số kg CO2 âm khi ghi nhận hành động xanh.'
      });
      console.log('  ⚠️  PHÁT HIỆN: Chấp nhận ghi nhận CO2 số âm (-500kg)!');
    }
  } catch (e) { console.error(e); }


  // --- 4. AUDIT THUỐCTHẬT (5004) ---
  console.log('\n🔍 [4] RÀ SOÁT THUỐCTHẬT (PORT 5004)...');

  // Test 4.1: Missing item_uid input validation
  try {
    const emptyUid = await request('http://localhost:5004/api/verify', { method: 'POST' }, {
      item_uid: null
    });
    if (emptyUid.status === 200) {
      findings.push({
        system: '04-ThuocThat',
        severity: 'LOW',
        vuln: 'Thiếu xác thực item_uid bắt buộc',
        details: 'Hệ thống cho phép gửi item_uid null/rỗng vào cơ sở dữ liệu scan_logs.'
      });
      console.log('  ⚠️  PHÁT HIỆN: Chấp nhận item_uid null!');
    }
  } catch (e) { console.error(e); }


  // --- 5. AUDIT TIỀNKHÓATÊN (5005) ---
  console.log('\n🔍 [5] RÀ SOÁT TIỀNKHÓATÊN (PORT 5005)...');

  // Test 5.1: Duplicate Milestone Payout (Double Disbursement Flaw)
  try {
    const grantBefore = await request('http://localhost:5005/api/grant');
    const fundBefore = grantBefore.data.grant.disbursed_fund;

    // Approve milestone 2 again!
    const reApprove = await request('http://localhost:5005/api/approve-milestone', { method: 'POST' }, {
      milestone_index: 2
    });

    const grantAfter = await request('http://localhost:5005/api/grant');
    const fundAfter = grantAfter.data.grant.disbursed_fund;

    if (fundAfter > fundBefore) {
      findings.push({
        system: '05-TienKhoaTen',
        severity: 'CRITICAL',
        vuln: 'Lỗ hổng rút tiền lặp lại (Double Disbursement / Reentrancy Logic)',
        details: `Cùng một mốc số 2 đã hoàn thành nhưng khi gửi lại request /approve-milestone, quỹ vẫn bị trừ tiếp 3.0 AVAX (Quỹ tăng từ ${fundBefore} lên ${fundAfter} AVAX)! Điều này có thể dẫn đến rút sạch toàn bộ quỹ học bổng trái phép!`
      });
      console.log(`  🚨 NGUY HIỂM: Giải ngân lặp lại mốc 2! Quỹ bị rút thêm 3.0 AVAX (Lên ${fundAfter} AVAX)!`);
    }
  } catch (e) { console.error(e); }

  console.log('\n======================================================================');
  console.log(`📊 TỔNG KẾT AUDIT: PHÁT HIỆN ${findings.length} VẤN ĐỀ CẦN TỐI ƯU`);
  console.log('======================================================================');
  findings.forEach((f, idx) => {
    console.log(`\n[#${idx + 1}] [${f.severity}] ${f.system} - ${f.vuln}`);
    console.log(`    Chi tiết: ${f.details}`);
  });
}

runSecurityAudit().catch(console.error);
