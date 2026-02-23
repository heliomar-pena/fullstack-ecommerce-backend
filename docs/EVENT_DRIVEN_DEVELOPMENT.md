# Event-Driven Design

In this documentation are described the events implemented to the backend.

## Table of Content

- [Event-Driven Design](#event-driven-design)
  - [Table of Content](#table-of-content)
  - [Identified and implemented Domain Events](#identified-and-implemented-domain-events)
    - [UserCreated](#usercreated)
    - [UserRoleChanged](#userrolechanged)
    - [ProductDeleted](#productdeleted)

## Identified and implemented Domain Events

### UserCreated

Triggered when a new user is successfully registered. This event currently is used to assign the default roles to the user when the user logged in. However, in future could scale to send a mail to the user to confirm user's email.

Or, if in future we have more features like coupons, promotions, XP system, or anything that needs to be initialized when a user is created, we could make all those configurations in listeners to this event.

Used to:

- Assign default role

Can scale to:

- Coupons / Promotions / Welcome email
- Email confirmation
- Set up KYC process or any process that needs initialization.

### UserRoleChanged

Triggered when roles are modified. It's used to notify the user when its role have changed. This refresh the UI instantly on the user's computer, that way if a user is Customer (doesn't have any permission in the UI currently), and its permissions changes to Admin, he doesn't have to refresh the screen to see the changes, the UI updates intantly.

Used to:

- Notify a user when his role changes if he is connected.

Can scale to:

- Send email or push notification to user
- Audit the change for security purposes, saving logs or similar

### ProductDeleted

Triggered when a product is removed. It's used to delete metadata of the product that will not be needed anymore now that the product is deleted. That means, that if a product have attributes, the product will be deleted first and the attributes for that product will be removed later in a separated event. This way we increase the success probability of the call to the backend as it only have to make one request, and the clean up is executed on a different place during a event.

Used to:

- Clean up the product's data from the DB once it's deleted
- Notify the merchant once the clean up is completed

Can scale to:

- Notify users that had this product in its cart or wishlish
- Clean up more data, like images, of the product from our storage system
