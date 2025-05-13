const express = require('express');
const cors = require('cors');
const Imap = require('imap');
const { simpleParser } = require('mailparser');

const app = express();
const port = 3001;

app.use(cors({
  origin: [
    'https://email-parser-imap.netlify.app/', 
    'http://localhost:8080'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Test endpoint
app.get('/', (req, res) => {
  res.send('Email Parser Backend is running');
});

// Add a test endpoint to verify CORS
app.get('/api/test-cors', (req, res) => {
  res.json({ message: 'CORS is working!' });
});

// Connect to email and fetch emails
app.post('/api/connect', async (req, res) => {
  const { email, password, imapHost, imapPort, useSSL } = req.body;
  
  const imap = new Imap({
    user: email,
    password: password,
    host: imapHost,
    port: imapPort,
    tls: useSSL,
    tlsOptions: { rejectUnauthorized: false }
  });
  
  function openInbox(cb) {
    imap.openBox('INBOX', false, cb);
  }
  
  try {
    const emails = [];
    
    imap.once('ready', function() {
      openInbox(function(err, box) {
        if (err) {
          console.error('Error opening inbox:', err);
          return res.status(500).json({ error: 'Failed to open inbox' });
        }
        
        // Fetch the most recent 10 emails
        const fetchOptions = {
          bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', '1'],
          markSeen: false
        };
        
        // Get the total number of messages
        const totalMessages = box.messages.total;
        
        // Calculate the range for the last 10 messages
        const start = Math.max(totalMessages - 9, 1);
        const end = totalMessages;
        
        if (totalMessages === 0) {
          return res.json({ success: true, emails: [] });
        }
        
        const fetch = imap.seq.fetch(`${start}:${end}`, fetchOptions);
        
        fetch.on('message', function(msg, seqno) {
          const email = {
            id: `email-${seqno}`,
            from: '',
            subject: '',
            date: '',
            preview: '',
            importance: Math.floor(Math.random() * 100), // Random importance for now
            readStatus: Math.random() > 0.4,
            categories: ['Inbox']
          };
          
          msg.on('body', function(stream, info) {
            let buffer = '';
            
            stream.on('data', function(chunk) {
              buffer += chunk.toString('utf8');
            });
            
            stream.once('end', function() {
              if (info.which === '1') {
                // Extract preview from email body
                const previewText = buffer.substring(0, 300).replace(/\n/g, ' ');
                email.preview = previewText;
              } else {
                // Parse header fields
                const header = Imap.parseHeader(buffer);
                email.from = header.from ? header.from[0] : '';
                email.subject = header.subject ? header.subject[0] : '(No Subject)';
                email.date = header.date ? header.date[0] : '';
              }
            });
          });
          
          msg.once('end', function() {
            emails.push(email);
          });
        });
        
        fetch.once('error', function(err) {
          console.error('Fetch error:', err);
          return res.status(500).json({ error: 'Failed to fetch emails' });
        });
        
        fetch.once('end', function() {
          imap.end();
          // Sort emails by date (newest first)
          emails.sort((a, b) => new Date(b.date) - new Date(a.date));
          return res.json({ success: true, emails });
        });
      });
    });
    
    imap.once('error', function(err) {
      console.error('IMAP error:', err);
      return res.status(500).json({ error: 'Failed to connect to email server' });
    });
    
    imap.connect();
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Email Parser Backend running on port ${port}`);
  });
}

// Export the Express app for Vercel
module.exports = app;





