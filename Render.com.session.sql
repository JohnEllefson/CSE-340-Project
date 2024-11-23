INSERT INTO account (
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )
VALUES (
        'Tony',
        'Stark',
        'tony@starkent.com',
        'Iam1ronM@n'
    );
-- Step 2: Change the account type for Tony Stark to 'Admin'
UPDATE account
SET account_type = 'Admin'
WHERE account_firstname = 'Tony'
    AND account_lastname = 'Stark';
-- Step 3: Delete the Tony Stark account record
DELETE FROM account
WHERE account_firstname = 'Tony'
    AND account_lastname = 'Stark';