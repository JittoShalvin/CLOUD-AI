import { useState } from 'react';
import { AlertCircle, CheckCircle, Copy, RefreshCw, Shield } from 'lucide-react';

function App() {
  const [finding, setFinding] = useState('');
  const [remediation, setRemediation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRemediation('');
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/remediate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ finding }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      setRemediation(data.remediation);
    } catch (err) {
      setError('Error occurred. Please try again.');
    }
    setLoading(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(remediation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text');
    }
  };

  const handleClear = () => {
    setFinding('');
    setRemediation('');
    setError('');
  };

  // Function to parse text and convert *text* or **text** to bold
  const formatText = (text) => {
    // Handle both single and double asterisks
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        // Remove double asterisks and make bold
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        // Remove single asterisks and make bold
        return <strong key={index}>{part.slice(1, -1)}</strong>;
      }
      return part;
    });
  };

  // Function to format the entire remediation text while preserving line breaks
  const formatRemediation = (text) => {
    const lines = text.split('\n');
    let inCodeBlock = false;
    let codeLines = [];
    const result = [];
    
    lines.forEach((line, lineIndex) => {
      // Handle code block start/end
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // End of code block
          result.push(
            <div key={`code-${lineIndex}`} style={{ 
              backgroundColor: '#1f2937', 
              color: '#f9fafb',
              padding: '16px', 
              borderRadius: '8px', 
              margin: '12px 0',
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
              fontSize: '0.875rem',
              overflowX: 'auto'
            }}>
              {codeLines.map((codeLine, idx) => (
                <div key={idx} style={{ minHeight: '1.5em' }}>
                  {codeLine || '\u00A0'}
                </div>
              ))}
            </div>
          );
          codeLines = [];
          inCodeBlock = false;
        } else {
          // Start of code block
          inCodeBlock = true;
        }
        return;
      }
      
      // If we're in a code block, collect lines
      if (inCodeBlock) {
        codeLines.push(line);
        return;
      }
      
      // Handle horizontal rules (---)
      if (line.trim() === '---') {
        result.push(
          <div key={lineIndex} style={{ margin: '16px 0' }}>
            <hr style={{ 
              border: 'none', 
              borderTop: '1px solid #e5e7eb',
              margin: 0
            }} />
          </div>
        );
      }
      // Handle checkbox-style formatting
      else if (line.trim().startsWith('- [ ]')) {
        const content = line.replace(/^(\s*)-\s*\[\s*\]\s*/, '');
        result.push(
          <div key={lineIndex} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ marginRight: '8px', color: '#6b7280' }}>☐</span>
            <span>{formatText(content)}</span>
          </div>
        );
      }
      // Handle regular bullet points
      else if (line.trim().startsWith('- ')) {
        const content = line.replace(/^(\s*)-\s*/, '');
        result.push(
          <div key={lineIndex} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ marginRight: '8px', color: '#6b7280' }}>•</span>
            <span>{formatText(content)}</span>
          </div>
        );
      }
      // Handle regular lines
      else {
        result.push(
          <div key={lineIndex} style={{ marginBottom: line.trim() ? '8px' : '4px' }}>
            {formatText(line)}
          </div>
        );
      }
    });
    
    // Handle case where code block doesn't close properly
    if (inCodeBlock && codeLines.length > 0) {
      result.push(
        <div key={`code-final`} style={{ 
          backgroundColor: '#1f2937', 
          color: '#f9fafb',
          padding: '16px', 
          borderRadius: '8px', 
          margin: '12px 0',
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          fontSize: '0.875rem',
          overflowX: 'auto'
        }}>
          {codeLines.map((codeLine, idx) => (
            <div key={idx} style={{ minHeight: '1.5em' }}>
              {codeLine || '\u00A0'}
            </div>
          ))}
        </div>
      );
    }
    
    return result;
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f2fd 0%, #e8eaf6 100%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    maxWidth: {
      maxWidth: '900px',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    headerTitle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      marginBottom: '16px'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: 0
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '1.1rem',
      margin: 0
    },
    card: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      marginBottom: '24px'
    },
    formGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '8px'
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      resize: 'vertical',
      minHeight: '120px',
      outline: 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s'
    },
    textareaFocus: {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px'
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '0.875rem'
    },
    primaryButton: {
      backgroundColor: '#3b82f6',
      color: 'white'
    },
    primaryButtonHover: {
      backgroundColor: '#2563eb'
    },
    primaryButtonDisabled: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed'
    },
    secondaryButton: {
      backgroundColor: '#e5e7eb',
      color: '#374151'
    },
    secondaryButtonHover: {
      backgroundColor: '#d1d5db'
    },
    errorCard: {
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px'
    },
    errorHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '4px'
    },
    errorTitle: {
      color: '#dc2626',
      fontWeight: '500',
      margin: 0
    },
    errorText: {
      color: '#dc2626',
      margin: 0
    },
    outputHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px'
    },
    outputTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    outputTitleText: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1f2937',
      margin: 0
    },
    copyButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      backgroundColor: '#f3f4f6',
      color: '#374151',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    copyButtonHover: {
      backgroundColor: '#e5e7eb'
    },
    codeBlock: {
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px'
    },
    formattedText: {
      fontSize: '0.875rem',
      color: '#1f2937',
      whiteSpace: 'pre-wrap',
      overflowX: 'auto',
      margin: 0,
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      lineHeight: '1.5'
    },
    loadingCard: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      padding: '48px',
      textAlign: 'center'
    },
    loadingText: {
      color: '#6b7280',
      margin: '16px 0 0 0'
    },
    footer: {
      textAlign: 'center',
      marginTop: '32px',
      color: '#6b7280',
      fontSize: '0.875rem'
    },
    spinning: {
      animation: 'spin 1s linear infinite'
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      
      <div style={styles.maxWidth}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTitle}>
            <Shield size={32} color="#3b82f6" />
            <h1 style={styles.title}>AWS Finding Remediator</h1>
          </div>
          <p style={styles.subtitle}>
            Automatically generate infrastructure remediation steps for AWS security findings
          </p>
        </div>

        {/* Main Content */}
        <div style={styles.card}>
          <div style={styles.formGroup}>
            <label htmlFor="finding" style={styles.label}>
              AWS Security Finding
            </label>
            <textarea
              id="finding"
              value={finding}
              onChange={(e) => setFinding(e.target.value)}
              placeholder="Paste your AWS security finding here (e.g., from Security Hub, GuardDuty, Inspector, etc.)..."
              style={styles.textarea}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          <div style={styles.buttonGroup}>
            <button
              onClick={handleSubmit}
              disabled={loading || !finding.trim()}
              style={{
                ...styles.button,
                ...styles.primaryButton,
                ...(loading || !finding.trim() ? styles.primaryButtonDisabled : {})
              }}
              onMouseEnter={(e) => {
                if (!loading && finding.trim()) {
                  e.target.style.backgroundColor = styles.primaryButtonHover.backgroundColor;
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && finding.trim()) {
                  e.target.style.backgroundColor = styles.primaryButton.backgroundColor;
                }
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} style={styles.spinning} />
                  Generating...
                </>
              ) : (
                <>
                  <Shield size={16} />
                  Generate Remediation
                </>
              )}
            </button>
            
            <button
              onClick={handleClear}
              style={{
                ...styles.button,
                ...styles.secondaryButton
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = styles.secondaryButtonHover.backgroundColor;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = styles.secondaryButton.backgroundColor;
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.errorCard}>
            <div style={styles.errorHeader}>
              <AlertCircle size={20} color="#dc2626" />
              <h4 style={styles.errorTitle}>Error</h4>
            </div>
            <p style={styles.errorText}>{error}</p>
          </div>
        )}

        {/* Remediation Output */}
        {remediation && (
          <div style={styles.card}>
            <div style={styles.outputHeader}>
              <div style={styles.outputTitle}>
                <CheckCircle size={20} color="#059669" />
                <h3 style={styles.outputTitleText}>Infrastructure Remediation</h3>
              </div>
              <button
                onClick={handleCopy}
                style={styles.copyButton}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = styles.copyButtonHover.backgroundColor;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = styles.copyButton.backgroundColor;
                }}
              >
                <Copy size={16} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            
            <div style={styles.codeBlock}>
              <div style={styles.formattedText}>
                {formatRemediation(remediation)}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={styles.loadingCard}>
            <RefreshCw size={32} color="#3b82f6" style={styles.spinning} />
            <p style={styles.loadingText}>Analyzing finding and generating remediation steps...</p>
          </div>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          <p>Ensure you review all remediation steps before applying them to your AWS infrastructure.</p>
        </div>
      </div>
    </div>
  );
}

export default App;