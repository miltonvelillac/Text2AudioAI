describe('main.ts', () => {
  it('executes the application entrypoint without throwing', async () => {
    if (!document.querySelector('app-root')) {
      document.body.appendChild(document.createElement('app-root'));
    }

    await expectAsync(import('./main')).toBeResolved();
  });
});
