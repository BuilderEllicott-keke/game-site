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
            // Query the users table for authentication
            const { data: user, error } = await supabase
                .from('users')
                .select('id, username, password, role, is_active')
                .eq('username', username)
                .eq('is_active', true)
                .single();

            if (error || !user) {
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({ success: false, message: 'Invalid username or password' })
                };
            }

            // Check password (in production, you should hash passwords)
            if (user.password !== password) {
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({ success: false, message: 'Invalid username or password' })
                };
            }

            // Generate session ID
            const sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            
            // Store session in user_sessions table (if it exists)
            try {
                await supabase
                    .from('user_sessions')
                    .insert({
                        session_id: sessionId,
                        user_id: user.id,
                        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
                    });
            } catch (sessionError) {
                console.log('Could not store session (table may not exist):', sessionError.message);
                // Continue without storing session
            }

            // Log login attempt (if login_logs table exists)
            try {
                await supabase
                    .from('login_logs')
                    .insert({
                        username: username,
                        success: true,
                        timestamp: new Date().toISOString(),
                        ip_address: event.headers['x-forwarded-for'] || 'unknown',
                        user_agent: event.headers['user-agent'] || 'unknown'
                    });
            } catch (logError) {
                console.log('Could not log login attempt (table may not exist):', logError.message);
                // Continue without logging
            }

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