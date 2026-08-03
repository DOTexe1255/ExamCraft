const express = require('express');
const { cpp, python, node, java } = require('compile-run');

const router = express.Router();

const runners = { cpp, python, node, java };

router.post('/', async (req, res) => {
  const { language, source, input } = req.body;

  console.log(`📥 ${language}: input="${String(input || '').substring(0, 50)}..."`);

  if (!language || !source) {
    return res.status(400).json({ error: 'language and source are required' });
  }

  const runner = runners[language];
  if (!runner) {
    return res.status(400).json({ error: `Unsupported language: ${language}` });
  }

  try {
    const result = await runner.runSource(source, {
      stdin: input || '',
      timeout: 5000,
      compileTimeout: 5000,
    });

    const normalizedStdout = (result.stdout || '').replace(/\r\n/g, '\n').trim();
    console.log(`📤 ${language}: exitCode=${result.exitCode}, stdout="${normalizedStdout.substring(0, 50)}..."`);

    return res.json({
      stdout: normalizedStdout,
      stderr: result.stderr || '',
      exitCode: result.exitCode || 0,
    });
  } catch (error) {
    console.error('❌ Execution error:', error.message);
    return res.status(500).json({
      stdout: '',
      stderr: error.message || 'Execution failed',
      exitCode: 1,
    });
  }
});

module.exports = router;