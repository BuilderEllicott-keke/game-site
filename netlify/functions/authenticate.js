// netlify/functions/authenticate.js - Real database version
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://ddoqcocxbdtiwvotqmyi.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkb3Fjb2N4YmR0aXd2b3RxbXlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5Nzc1OTIsImV4cCI6MjA3MzU1MzU5Mn0.tR05IKupRtgH_RpV9yEIHn3ha_HRzKk7I-9RGtdWzq4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        if (!event.body) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, message: 'No request body provided' })
            };
        }

        const { username, password, action } = JSON.parse(event.body);

        if (action === 'login') {
            console.log('Attempting login for username:', username);
            
            // Try database first for all accounts
            try {
                console.log('Trying database authentication...');
                const { data: user, error } = await supabase
                    .from('users')
                    .select('id, username, password, role, is_active')
                    .eq('username', username)
                    .eq('is_active', true)
                    .single();

                console.log('Database query result:', { user, error });

                if (!error && user) {
                    // Check password (in production, you should hash passwords)
                    if (user.password === password) {
                        console.log('Login successful (database) for user:', username, 'role:', user.role);
                        
                        // Generate session ID
                        const sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
                        
                        return {
                            statusCode: 200,
                            headers,
                            body: JSON.stringify({
                                success: true,
                                role: user.role,
                                sessionId: sessionId,
                                message: 'Login successful'
                            })
                        };
                    } else {
                        console.log('Password mismatch for user:', username);
                        return {
                            statusCode: 401,
                            headers,
                            body: JSON.stringify({ success: false, message: 'Invalid username or password' })
                        };
                    }
                }
            } catch (dbError) {
                console.error('Database connection error:', dbError);
            }
            
            // Fallback to hardcoded credentials if database fails or user not found
            console.log('Falling back to hardcoded credentials...');
            if ((username === 'GregEllicott' && password === '111010') || 
                (username === 'TestingAccount' && password === 'Test12') ||
                (username === 'HurleyV' && password === 'password')) {
                
                const role = username === 'GregEllicott' ? 'admin' : 'user';
                const sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
                
                console.log('Login successful (hardcoded) for user:', username, 'role:', role);
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        role: role,
                        sessionId: sessionId,
                        message: 'Login successful (fallback)'
                    })
                };
            }
            
            // If neither database nor hardcoded credentials work
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ success: false, message: 'Invalid username or password' })
            };
        }

        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, message: 'Invalid action' })
        };

    } catch (error) {
        console.error('Authentication error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                message: 'Server error: ' + error.message 
            })
        };
    }
};