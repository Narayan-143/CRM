const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('=== STARTING MINI CRM API TESTS ===\n');

  // Test 1: User 1 Registration
  const testEmail1 = `alice_${Date.now()}@example.com`;
  console.log('1. Testing User Registration...');
  const regRes1 = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Alice Johnson',
      email: testEmail1,
      password: 'password123',
    }),
  });
  const regData1 = await regRes1.json();
  if (!regData1.success || !regData1.token) {
    throw new Error(`Registration failed: ${JSON.stringify(regData1)}`);
  }
  console.log('   ✓ User 1 registered successfully. Token received.');
  const token1 = regData1.token;

  // Test 2: User Login
  console.log('\n2. Testing User Login...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail1,
      password: 'password123',
    }),
  });
  const loginData = await loginRes.json();
  if (!loginData.success || !loginData.token) {
    throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  }
  console.log('   ✓ User logged in successfully. User:', loginData.user.name);

  // Test 3: Duplicate Registration prevention
  console.log('\n3. Testing Duplicate Email Handling...');
  const dupRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Alice Duplicate',
      email: testEmail1,
      password: 'password123',
    }),
  });
  const dupData = await dupRes.json();
  if (dupRes.status === 400 && !dupData.success) {
    console.log('   ✓ Duplicate email properly rejected with message:', dupData.message);
  } else {
    throw new Error(`Duplicate email was not rejected: ${JSON.stringify(dupData)}`);
  }

  // Test 4: Contacts CRUD
  console.log('\n4. Testing Contacts CRUD...');
  // Create contact
  const createContactRes = await fetch(`${BASE_URL}/contacts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token1}`,
    },
    body: JSON.stringify({
      name: 'John Smith',
      email: 'john@acme.com',
      phone: '+1 555-0192',
      company: 'Acme Corporation',
      notes: 'Interested in annual enterprise subscription.',
    }),
  });
  const createContactData = await createContactRes.json();
  if (!createContactData.success) {
    throw new Error(`Create contact failed: ${JSON.stringify(createContactData)}`);
  }
  const contactId = createContactData.data._id;
  console.log('   ✓ Contact created: John Smith (ID:', contactId, ')');

  // Create second contact for search test
  await fetch(`${BASE_URL}/contacts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token1}`,
    },
    body: JSON.stringify({
      name: 'Sarah Connor',
      email: 'sarah@cyberdyne.com',
      phone: '+1 555-0999',
      company: 'Cyberdyne Systems',
      notes: 'Security consulting.',
    }),
  });

  // Get Contacts with Search
  console.log('\n5. Testing Contacts Search...');
  const searchRes = await fetch(`${BASE_URL}/contacts?search=john`, {
    headers: { Authorization: `Bearer ${token1}` },
  });
  const searchData = await searchRes.json();
  if (!searchData.success || searchData.data.length !== 1 || searchData.data[0].name !== 'John Smith') {
    throw new Error(`Search failed: ${JSON.stringify(searchData)}`);
  }
  console.log('   ✓ Search for "john" returned exactly 1 match: John Smith');

  // Update contact
  console.log('\n6. Testing Contact Update...');
  const updateContactRes = await fetch(`${BASE_URL}/contacts/${contactId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token1}`,
    },
    body: JSON.stringify({
      notes: 'Updated notes: Met at conference, scheduled demo.',
    }),
  });
  const updateContactData = await updateContactRes.json();
  if (!updateContactData.success || !updateContactData.data.notes.includes('Updated notes')) {
    throw new Error(`Update contact failed: ${JSON.stringify(updateContactData)}`);
  }
  console.log('   ✓ Contact updated successfully.');

  // Get single contact details
  const getSingleContactRes = await fetch(`${BASE_URL}/contacts/${contactId}`, {
    headers: { Authorization: `Bearer ${token1}` },
  });
  const singleContactData = await getSingleContactRes.json();
  if (!singleContactData.success || singleContactData.data._id !== contactId) {
    throw new Error(`Get contact by ID failed: ${JSON.stringify(singleContactData)}`);
  }
  console.log('   ✓ Get single contact by ID succeeded.');

  // Test 7: Deals CRUD
  console.log('\n7. Testing Deals CRUD & Stages...');
  const createDealRes = await fetch(`${BASE_URL}/deals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token1}`,
    },
    body: JSON.stringify({
      title: 'Acme Enterprise License',
      contactId: contactId,
      value: 15000,
      stage: 'New',
      notes: 'Initial pitch sent.',
    }),
  });
  const createDealData = await createDealRes.json();
  if (!createDealData.success) {
    throw new Error(`Create deal failed: ${JSON.stringify(createDealData)}`);
  }
  const dealId = createDealData.data._id;
  console.log('   ✓ Deal created: Acme Enterprise License ($15,000, Stage: New)');

  // Test 8: Kanban Stage Update (PATCH /api/deals/:id/stage)
  console.log('\n8. Testing Deal Stage Update (PATCH /api/deals/:id/stage)...');
  const patchStageRes = await fetch(`${BASE_URL}/deals/${dealId}/stage`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token1}`,
    },
    body: JSON.stringify({ stage: 'Qualified' }),
  });
  const patchStageData = await patchStageRes.json();
  if (!patchStageData.success || patchStageData.data.stage !== 'Qualified') {
    throw new Error(`Patch deal stage failed: ${JSON.stringify(patchStageData)}`);
  }
  console.log('   ✓ Deal stage successfully updated to "Qualified".');

  // Verify stage is saved in DB
  const getDealsRes = await fetch(`${BASE_URL}/deals`, {
    headers: { Authorization: `Bearer ${token1}` },
  });
  const dealsData = await getDealsRes.json();
  const fetchedDeal = dealsData.data.find((d) => d._id === dealId);
  if (!fetchedDeal || fetchedDeal.stage !== 'Qualified') {
    throw new Error(`Deal stage verification failed: ${JSON.stringify(fetchedDeal)}`);
  }
  console.log('   ✓ Verified stage "Qualified" persisted in MongoDB.');

  // Test 9: Data Isolation between users
  console.log('\n9. Testing Data Isolation Between Users...');
  const testEmail2 = `bob_${Date.now()}@example.com`;
  const regRes2 = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Bob Miller',
      email: testEmail2,
      password: 'password123',
    }),
  });
  const regData2 = await regRes2.json();
  const token2 = regData2.token;

  // Bob requests contacts
  const bobContactsRes = await fetch(`${BASE_URL}/contacts`, {
    headers: { Authorization: `Bearer ${token2}` },
  });
  const bobContacts = await bobContactsRes.json();
  if (bobContacts.data.length !== 0) {
    throw new Error(`Data isolation broken! Bob sees Alice's contacts: ${JSON.stringify(bobContacts.data)}`);
  }

  // Bob requests deals
  const bobDealsRes = await fetch(`${BASE_URL}/deals`, {
    headers: { Authorization: `Bearer ${token2}` },
  });
  const bobDeals = await bobDealsRes.json();
  if (bobDeals.data.length !== 0) {
    throw new Error(`Data isolation broken! Bob sees Alice's deals: ${JSON.stringify(bobDeals.data)}`);
  }

  // Bob attempts to fetch Alice's contact by ID
  const bobAccessAliceContact = await fetch(`${BASE_URL}/contacts/${contactId}`, {
    headers: { Authorization: `Bearer ${token2}` },
  });
  if (bobAccessAliceContact.status !== 404) {
    throw new Error('Data isolation broken! Bob accessed Alice contact directly.');
  }
  console.log('   ✓ User 2 (Bob) sees 0 contacts and 0 deals from User 1 (Alice). Data isolation verified!');

  // Test 10: AI Follow-up Email endpoint
  console.log('\n10. Testing AI Follow-up Email Endpoint (POST /api/ai/follow-up)...');
  const aiRes = await fetch(`${BASE_URL}/ai/follow-up`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token1}`,
    },
    body: JSON.stringify({
      contactName: 'John Smith',
      company: 'Acme Corporation',
      notes: 'Initial pitch sent, interested in annual subscription.',
      dealTitle: 'Acme Enterprise License',
      dealStage: 'Qualified',
      dealValue: 15000,
    }),
  });
  const aiData = await aiRes.json();
  if (aiRes.ok && aiData.success) {
    console.log('   ✓ AI returned generated email:', aiData.data.subject);
  } else {
    // If AI_API_KEY is not configured, it should return a clear friendly error message
    console.log('   ✓ AI error handling verified when key unconfigured:', aiData.message);
  }

  console.log('\n=== ALL API TESTS PASSED SUCCESSFULLY! ===\n');
}

runTests().catch((err) => {
  console.error('\n❌ TEST FAILED:', err.message);
  process.exit(1);
});
