import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (email, resetToken) => {
    try {
        const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

        const { data, error } = await resend.emails.send({
            from: 'Code Battle Arena <noreply@codebattlearena.id.vn>',
            to: [email],
            subject: 'Reset Your Password - Code Battle Arena',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Reset Your Password</h2>
                    <p>You requested a password reset for your Code Battle Arena account.</p>
                    <p>Click the link below to reset your password:</p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you didn't request this reset, please ignore this email.</p>
                    <p>Best regards,<br>Code Battle Arena Team</p>
                </div>
            `,
        });

        if (error) {
            console.error('Error sending email:', error);
            return false;
        }

        console.log('Password reset email sent successfully:', data);
        return true;
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return false;
    }
};