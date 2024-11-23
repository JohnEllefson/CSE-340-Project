-- Step 1: Add Tony Stark to the account table
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
-- Step 4: Modify the GM Hummer record.
UPDATE inventory
SET inv_description = REPLACE(
        inv_description,
        'small interiors',
        'a huge interior'
    )
WHERE inv_make = 'GM'
    AND inv_model = 'Hummer';
-- Step 5: Use an inner join to select sport vehicles from the inventory table.
SELECT inv_make,
    inv_model,
    classification_name AS classification
FROM inventory
    INNER JOIN classification ON inventory.classification_id = classification.classification_id
WHERE classification_name = 'Sport';
-- Step 6: Update all records in the inventory table to update the file path.
UPDATE inventory
SET inv_image = REPLACE(
        inv_image,
        '/images/',
        '/images/vehicles/'
    ),
    inv_thumbnail = REPLACE(
        inv_thumbnail,
        '/images/',
        '/images/vehicles/'
    );