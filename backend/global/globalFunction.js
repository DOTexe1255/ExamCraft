// Function to create a simple fingerprint from request headers 
const createFingerprint = (req) => {
  const ua = req.headers['user-agent'] || '';
  const platform = req.headers['sec-ch-ua-platform'] || 'unknown';
  const mobile = req.headers['sec-ch-ua-mobile'] ? 'mobile' : 'desktop';
  
  return `${ua.substring(0, 80)}-${platform}-${mobile}`.replace(/[^a-zA-Z0-9-]/g, '');
};

module.exports = createFingerprint;