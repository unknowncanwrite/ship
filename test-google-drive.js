/**
 * Google Drive Test Script
 * Run this to test your service account credentials
 * 
 * Usage:
 * 1. Copy your environment variables from Vercel to a .env file
 * 2. Run: node test-google-drive.js
 */

require('dotenv').config();
const { google } = require('googleapis');

async function testGoogleDrive() {
    console.log('\n=== Testing Google Drive Service Account ===\n');

    // Check environment variables
    console.log('1. Checking Environment Variables...');
    const hasEmail = !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const hasKey = !!process.env.GOOGLE_PRIVATE_KEY;
    const hasFolderId = !!process.env.GOOGLE_DRIVE_FOLDER_ID;

    console.log(`   ✓ GOOGLE_SERVICE_ACCOUNT_EMAIL: ${hasEmail ? '✅ Set' : '❌ Missing'}`);
    console.log(`   ✓ GOOGLE_PRIVATE_KEY: ${hasKey ? '✅ Set' : '❌ Missing'}`);
    console.log(`   ✓ GOOGLE_DRIVE_FOLDER_ID: ${hasFolderId ? '✅ Set' : '❌ Missing'}`);

    if (!hasEmail || !hasKey || !hasFolderId) {
        console.error('\n❌ Missing required environment variables!');
        console.log('\nMake sure your .env file has:');
        console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL=...');
        console.log('GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"');
        console.log('GOOGLE_DRIVE_FOLDER_ID=...');
        return;
    }

    console.log(`\n   Service Account: ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}`);
    console.log(`   Folder ID: ${process.env.GOOGLE_DRIVE_FOLDER_ID}`);

    // Test authentication
    console.log('\n2. Testing Authentication...');
    try {
        const auth = new google.auth.JWT(
            process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            null,
            process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            ['https://www.googleapis.com/auth/drive']
        );

        await auth.authorize();
        console.log('   ✅ Authentication successful!');

        // Test folder access
        console.log('\n3. Testing Folder Access...');
        const drive = google.drive({ version: 'v3', auth });

        try {
            const folderInfo = await drive.files.get({
                fileId: process.env.GOOGLE_DRIVE_FOLDER_ID,
                fields: 'id, name, capabilities'
            });

            console.log(`   ✅ Folder found: "${folderInfo.data.name}"`);
            console.log(`   ✅ Can add files: ${folderInfo.data.capabilities?.canAddChildren}`);

            if (!folderInfo.data.capabilities?.canAddChildren) {
                console.error('\n   ❌ Service account CANNOT upload files to this folder!');
                console.log('\n   Fix: Share the folder with:');
                console.log(`   ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}`);
                console.log('   Permission: Editor');
                return;
            }

        } catch (error) {
            console.error('   ❌ Cannot access folder!');
            console.error(`   Error: ${error.message}`);
            console.log('\n   Possible reasons:');
            console.log('   1. Folder ID is incorrect');
            console.log('   2. Folder not shared with service account');
            console.log('\n   Fix: Share folder with:');
            console.log(`   ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}`);
            return;
        }

        // Test file upload
        console.log('\n4. Testing File Upload...');
        const testFileMetadata = {
            name: `test-upload-${Date.now()}.txt`,
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID]
        };

        const testContent = 'This is a test file from the Google Drive test script.';
        const media = {
            mimeType: 'text/plain',
            body: testContent
        };

        const uploadResponse = await drive.files.create({
            requestBody: testFileMetadata,
            media: media,
            fields: 'id, name, webViewLink'
        });

        console.log(`   ✅ Test file uploaded successfully!`);
        console.log(`   File ID: ${uploadResponse.data.id}`);
        console.log(`   File Name: ${uploadResponse.data.name}`);
        console.log(`   View Link: ${uploadResponse.data.webViewLink}`);

        // Clean up test file
        console.log('\n5. Cleaning up test file...');
        await drive.files.delete({ fileId: uploadResponse.data.id });
        console.log('   ✅ Test file deleted');

        console.log('\n✅ ALL TESTS PASSED! Google Drive integration is working correctly.\n');

    } catch (error) {
        console.error('\n❌ Authentication failed!');
        console.error(`Error: ${error.message}`);
        console.log('\nPossible reasons:');
        console.log('1. Private key format is incorrect');
        console.log('2. Service account email is wrong');
        console.log('3. Service account has been deleted');
    }
}

testGoogleDrive().catch(console.error);
