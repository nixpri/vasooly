describe('Vasooly App', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show UPI Validation screen on launch', async () => {
    await expect(element(by.text('UPI Validation'))).toBeVisible();
  });

  it('should have Run UPI Validation button', async () => {
    await expect(element(by.text('Run UPI Validation'))).toBeVisible();
  });

  it('should show device information', async () => {
    await expect(element(by.text('Current Device'))).toBeVisible();
  });
});
