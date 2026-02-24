use bizra_node0::AppState;

pub struct TestDb;

pub async fn setup_test_db() -> TestDb {
    TestDb
}

pub async fn teardown_test_db(db: TestDb) {
    // Teardown logic
}
