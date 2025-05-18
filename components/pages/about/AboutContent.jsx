

export default function AboutPage() {
    return (

        <div style={{ backgroundColor: 'white', color: '#333', minHeight: '100vh', padding: '2rem' }}>
            <img src="/images/Logo_White.png" alt="SharedCents Logo" style={{ display: 'block', margin: '0 auto', width: '200px' }} />
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
            <p style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>Group members</p>
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                maxWidth: '600px',
                margin: '0 auto',
                textAlign: 'center',
                fontSize: '1rem'
            }}>
                <span>Ilias K. (project manager)</span>
                <span>Kenny L.</span>
                <span>Tai N.</span>
            </div>

            <p style={{ textAlign: 'center', marginTop: '2rem' }}>You can contact us at:</p>
            <p style={{ textAlign: 'center' }}>sharedcents@gmail.com</p>
        </div>

    );
}