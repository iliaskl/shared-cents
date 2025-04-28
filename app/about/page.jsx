export default function AboutPage() {
    return (
        <div style={{ backgroundColor: '#f1e0c7', color: '#333', minHeight: '100vh', padding: '2rem' }}>
            <img src="/images/Logo.png" alt="SharedCents Logo" style={{ display: 'block', margin: '0 auto', width: '200px' }} />
            <h1 style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>
                About Us
            </h1>
            <p style={{ textAlign: 'center' }}>Welcome to our website. This website is a group project started Spring of 2025.</p>
            <p style={{ textAlign: 'center' }}>Our mission is to help groups of people settle finance sharing in an organized fashion.</p>
            <div style={{
                textAlign: 'center',
                borderTop: '2px solid #333',
                marginTop: '2rem',
                paddingTop: '1rem'
            }}></div>
            <p style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>Group members:</p>
            <li style={{ textAlign: 'center' }}>Ilias K. (project manager)</li>
            <li style={{ textAlign: 'center' }}>Kenny L.</li>
            <li style={{ textAlign: 'center' }}>Tai N.</li>
        </div>
    );
}