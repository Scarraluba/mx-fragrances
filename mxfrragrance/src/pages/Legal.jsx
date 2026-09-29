/**
 * Project: mx-fragrances
 * Created: 2026/09/29 04:39
 * Author: Scarra Luba
 */

import React, {useState, useEffect, useMemo} from 'react';
import {useLocation, useNavigate, Link} from 'react-router-dom';
import {motion, AnimatePresence} from 'framer-motion';
import {
    ArrowLeft, ChevronRight, FileText, Shield, Truck, CreditCard,
    Scale, AlertCircle, CheckCircle2, Calendar, Clock, Gavel,
    ChevronDown, Printer, Share2, BookOpen, Lock
} from 'lucide-react';

// ============================================
// LEGAL CONTENT DATA
// ============================================

const LEGAL_DOCUMENTS = {
    terms: {
        id: 'terms',
        title: 'Terms of Vault',
        shortTitle: 'Terms',
        description: 'Terms & Conditions governing use of MX Fragrances website and purchases',
        icon: Scale,
        effectiveDate: '29 September 2026',
        lastUpdated: '29 September 2026',
        sections: [
            {
                id: 'about',
                title: 'About MX Fragrances',
                content: `MX Fragrances is an online fragrance retailer offering fragrances and related products through its website and designated customer communication channels.

Products may be offered in different brands, categories, sizes, formats, variants and conditions. Product information may include fragrance notes, descriptions, pricing, stock status, batch information, authenticity information, packaging information and other product-specific details.

Where a product listing identifies a particular condition, format, size, packaging state or other characteristic, that description forms part of the information provided to the customer before purchase.`
            },
            {
                id: 'product-info',
                title: 'Product Information',
                content: `MX Fragrances takes reasonable steps to ensure that product descriptions, photographs, pricing, availability, sizes, specifications and other information displayed on the website are accurate and current.

However:

• product photographs may vary slightly from the physical product because of lighting, photography, screen settings or manufacturer packaging changes;
• manufacturer packaging, labels, boxes or other presentation may change without prior notice;
• fragrance colour may vary between batches;
• fragrance performance, projection and longevity may differ between individuals and environments;
• fragrance preference is subjective and does not constitute a product defect merely because a customer does not personally enjoy a fragrance.

Nothing in this section limits any consumer right relating to a product that is defective, unsafe, materially misdescribed or otherwise fails to comply with applicable law.`
            },
            {
                id: 'product-condition',
                title: 'Product Condition',
                content: `Where a product is listed as "Sealed", "New" or otherwise described as unopened, the product will be supplied in the condition stated in its listing, subject to ordinary manufacturer packaging characteristics.

Where a product is expressly offered in a particular condition and that condition is disclosed to the customer before purchase, the customer will be purchasing the product on the basis of that disclosed condition.

A disclosed condition does not, however, remove statutory consumer rights that cannot legally be excluded.`
            },
            {
                id: 'authenticity',
                title: 'Authenticity',
                content: `MX Fragrances records product-specific authenticity information where available. This may include batch codes, source information, product identifiers and other verification records.

An authenticity record or verification statement relates to the product information available to MX Fragrances at the time of listing and does not constitute a manufacturer's warranty unless expressly stated as such.

Customers must not alter, remove or intentionally obscure product identifiers, batch codes, labels or other identifying information where doing so would interfere with legitimate verification, warranty or return processes.`
            },
            {
                id: 'prices',
                title: 'Prices',
                content: `All prices displayed on the website are stated in South African Rand (ZAR), unless expressly indicated otherwise.

Prices may change at any time before an order is accepted.

A displayed price does not by itself constitute acceptance of an order.

Where an obvious pricing error occurs, MX Fragrances may contact the customer before accepting the order to correct the error or cancel the affected order and refund any payment received in respect of that order, subject to applicable law.`
            },
            {
                id: 'availability',
                title: 'Availability',
                content: `Products are subject to availability.

A product appearing on the website does not guarantee that the product will remain available until payment has been verified and the order has been accepted.

Where a product becomes unavailable after payment has been received, MX Fragrances will notify the customer and provide the applicable remedy, including a refund where required by law.`
            },
            {
                id: 'website-orders',
                title: 'Website Orders',
                content: `Submitting an order through the website constitutes a request to purchase the selected products.

It does not automatically mean that MX Fragrances has accepted the order.

Order acceptance is governed by the Payment & Order Policy.

MX Fragrances may contact the customer to confirm order details, payment, delivery information or other information reasonably necessary to process the transaction.`
            },
            {
                id: 'payment',
                title: 'Payment',
                content: `MX Fragrances currently uses manual payment verification for orders.

The customer must follow the payment instructions provided by MX Fragrances and submit the required Proof of Payment through the official MX Fragrances WhatsApp channel.

A payment instruction displayed on the website or communicated to a customer must be checked carefully before payment is made.

MX Fragrances will not regard an altered, fabricated, incomplete or unverifiable Proof of Payment as confirmation that payment has been made.

An order is not confirmed merely because a customer has sent a screenshot or payment notification.`
            },
            {
                id: 'order-confirmation',
                title: 'Order Confirmation',
                content: `An order becomes confirmed only after MX Fragrances has verified the payment and communicated confirmation of the order through an official customer communication channel.

Until confirmation:

• stock may remain available to other customers;
• the product may not be reserved indefinitely;
• MX Fragrances may request additional information;
• the order may remain pending.`
            },
            {
                id: 'delivery',
                title: 'Delivery',
                content: `Delivery is subject to the Shipping & Returns Policy.

Customers are responsible for providing accurate delivery information and ensuring that the delivery address is accessible and capable of receiving the shipment.

Where the customer provides incorrect, incomplete or outdated delivery information, additional delivery charges or delays may arise.

Nothing in these Terms excludes any rights or remedies arising from MX Fragrances' own failure to perform its obligations.`
            },
            {
                id: 'inspection',
                title: 'Inspection on Receipt',
                content: `Customers should inspect their order as soon as reasonably possible after delivery.

Where there is visible damage to the parcel, incorrect merchandise, missing merchandise or another apparent issue, the customer should document the issue with photographs and contact MX Fragrances through the official communication channel as soon as reasonably possible.

A failure to immediately report an issue does not by itself remove a statutory right where that right otherwise applies.`
            },
            {
                id: 'returns-refunds',
                title: 'Returns, Refunds and Defective Goods',
                content: `Returns and refunds are governed by the Shipping & Returns Policy and applicable South African consumer law.

MX Fragrances will not use a "no returns" rule to exclude rights that consumers have under applicable legislation.

For example, applicable law may provide rights relating to electronic transactions, defective goods, goods that fail to meet statutory quality requirements, or other circumstances.`
            },
            {
                id: 'fragrance-considerations',
                title: 'Fragrance-Specific Considerations',
                content: `Fragrance products are personal-use products.

A customer may not treat a change of preference, dislike of a fragrance after opening or failure to match a customer's personal expectations as automatically establishing that the product is defective.

Where a customer has a legitimate statutory claim relating to a defective, unsafe, materially misdescribed or otherwise non-compliant product, that claim will be assessed according to applicable law.`
            },
            {
                id: 'website-use',
                title: 'Website Use',
                content: `Customers may use the website only for lawful purposes.

You may not:

• interfere with the operation or security of the website;
• attempt unauthorised access to administrative systems;
• submit fraudulent orders;
• use another person's personal or payment information without authorisation;
• upload malicious software;
• scrape, copy or reproduce website content for unlawful purposes;
• impersonate MX Fragrances or its representatives;
• use the website to facilitate fraud or other unlawful activity.

MX Fragrances may restrict or suspend access where reasonably necessary to protect the website, customers, the business or third parties, subject to applicable law.`
            },
            {
                id: 'intellectual-property',
                title: 'Intellectual Property',
                content: `The MX Fragrances name, logo, branding, website design, written content, photographs, graphics and other original website materials are owned by or licensed to MX Fragrances unless otherwise indicated.

No material may be reproduced, distributed, modified, republished or commercially exploited without appropriate permission, except where permitted by law.`
            },
            {
                id: 'third-party',
                title: 'Third-Party Services',
                content: `The website may rely on third-party services, including hosting, analytics, communications, payment-related services, delivery providers and social-media platforms.

MX Fragrances is not responsible for independent outages, failures or policies of third-party providers, except to the extent that applicable law provides otherwise.`
            },
            {
                id: 'fraud-abuse',
                title: 'Fraud and Abuse',
                content: `MX Fragrances may delay, refuse or investigate an order where there are reasonable grounds to suspect fraud, payment manipulation, identity misuse, attempted theft, abuse of promotional mechanisms or other unlawful activity.

Where an investigation requires additional information, the customer may be asked to provide reasonable information necessary to verify the transaction.

Nothing in this section authorises MX Fragrances to retain money unlawfully or to disregard consumer rights.`
            },
            {
                id: 'limitation-liability',
                title: 'Limitation of Liability',
                content: `To the maximum extent permitted by law, MX Fragrances will not be liable for indirect or consequential loss arising from circumstances outside its reasonable control.

Nothing in these Terms excludes or limits liability where such exclusion or limitation is prohibited by law, including liability arising from unlawful conduct, fraud, gross negligence where the law prevents exclusion, or statutory consumer rights.`
            },
            {
                id: 'force-majeure',
                title: 'Events Outside Reasonable Control',
                content: `MX Fragrances will not be responsible for delays caused by circumstances beyond its reasonable control, including major network failures, courier disruptions, natural disasters, strikes, civil emergencies, government restrictions, infrastructure failures or other events that could not reasonably have been prevented.

Where such an event affects an order, MX Fragrances will take reasonable steps to communicate the delay and complete the transaction or provide the applicable remedy.`
            },
            {
                id: 'changes',
                title: 'Changes to These Terms',
                content: `MX Fragrances may update these Terms from time to time.

The version applicable to a transaction will be the version that was made available to the customer at the relevant time, subject to applicable law.

Changes will not retrospectively remove rights that have already accrued.`
            },
            {
                id: 'privacy',
                title: 'Privacy',
                content: `Personal information is processed in accordance with the MX Fragrances Privacy Policy and applicable South African data-protection law.`
            },
            {
                id: 'complaints',
                title: 'Complaints and Disputes',
                content: `Customers should first contact MX Fragrances through the official customer communication channel so that the matter can be investigated and resolved.

Nothing in this process prevents a consumer from exercising a right to approach a competent regulatory, statutory, dispute-resolution or judicial body.`
            },
            {
                id: 'governing-law',
                title: 'Governing Law',
                content: `These Terms are governed by the laws of the Republic of South Africa, subject to any mandatory consumer protections that apply to the transaction.`
            },
            {
                id: 'severability',
                title: 'Severability',
                content: `If any provision of these Terms is found to be unlawful, invalid or unenforceable, that provision will be interpreted or severed to the minimum extent necessary, and the remaining provisions will continue to apply to the extent permitted by law.`
            },
            {
                id: 'entire-agreement',
                title: 'Entire Agreement',
                content: `These Terms, together with the Privacy Policy, Shipping & Returns Policy, Payment & Order Policy and any transaction-specific information supplied to the customer, form the contractual framework applicable to the transaction, subject always to applicable law.`
            },
            {
                id: 'statutory-rights',
                title: 'Statutory Rights',
                content: `Nothing in these Terms limits, removes or replaces a consumer's rights under applicable South African legislation.

Where a conflict exists between these Terms and a mandatory statutory consumer protection, the statutory protection will prevail to the extent required by law.`
            }
        ]
    },
    privacy: {
        id: 'privacy',
        title: 'Privacy Policy',
        shortTitle: 'Privacy',
        description: 'How MX Fragrances collects, uses, and protects your personal information',
        icon: Shield,
        effectiveDate: '29 September 2026',
        lastUpdated: '29 September 2026',
        sections: [
            {
                id: 'info-collect',
                title: 'Personal Information We May Collect',
                content: `Depending on how you interact with MX Fragrances, we may collect:

• name and surname;
• telephone or mobile number;
• WhatsApp contact details;
• email address;
• delivery address;
• billing or transaction information;
• order details;
• product selections;
• Proof of Payment documents;
• payment reference information;
• correspondence between you and MX Fragrances;
• customer-service enquiries;
• return, refund or complaint information;
• information necessary to prevent fraud or verify transactions;
• technical information relating to your use of the website, where such information is collected by our website or service providers.

We do not intentionally request personal information that is unnecessary for the relevant transaction or service.`
            },
            {
                id: 'proof-of-payment',
                title: 'Proof of Payment Information',
                content: `Because MX Fragrances uses manual payment verification, customers may be required to send Proof of Payment through the official MX Fragrances WhatsApp channel.

A Proof of Payment may contain personal and financial transaction information, including the account holder's name, transaction amount, date, reference number and bank-related information.

This information is used for purposes including:

• verifying that payment was made;
• matching payment to an order;
• preventing fraudulent payment claims;
• maintaining transaction records;
• resolving payment disputes;
• meeting accounting, legal or regulatory obligations.

Customers should not send passwords, PINs, full card numbers, online-banking login credentials or other security credentials to MX Fragrances.`
            },
            {
                id: 'why-process',
                title: 'Why We Process Personal Information',
                content: `Personal information may be processed where necessary to:

• process and fulfil orders;
• verify payments;
• communicate with customers;
• arrange delivery;
• process returns, refunds and complaints;
• maintain business and transaction records;
• prevent fraud and abuse;
• maintain website and business security;
• comply with legal and regulatory obligations;
• respond to lawful requests from competent authorities;
• improve our products, services and website;
• communicate information relating to an existing customer relationship where permitted by law.

Where consent is required by law, we will obtain consent in the appropriate manner.`
            },
            {
                id: 'lawful-processing',
                title: 'Lawful Processing',
                content: `MX Fragrances processes personal information in accordance with applicable law and applicable POPIA conditions.

We aim to collect information for specific, explicitly defined and legitimate purposes and to limit collection to information reasonably necessary for those purposes.

Personal information should be accurate and, where necessary, kept up to date.`
            },
            {
                id: 'sharing',
                title: 'Sharing Personal Information',
                content: `MX Fragrances does not sell customer personal information.

Personal information may be disclosed to third parties where reasonably necessary for legitimate business, contractual, legal or regulatory purposes.

Depending on the transaction, recipients may include:

• courier and delivery providers;
• technology and hosting providers;
• communication providers;
• professional advisers;
• accounting or auditing service providers;
• fraud-prevention or security providers;
• regulatory or law-enforcement authorities where legally required or permitted.

Only information reasonably necessary for the relevant purpose should be disclosed.

Third parties that process information on our behalf may be required to implement appropriate confidentiality and security measures.`
            },
            {
                id: 'whatsapp',
                title: 'WhatsApp Communications',
                content: `Customers may communicate with MX Fragrances through WhatsApp for order, payment and customer-service purposes.

WhatsApp is operated by an independent third party and its own terms, privacy practices and technical infrastructure apply to the use of that platform.

Customers should avoid sending unnecessary sensitive information through WhatsApp.

MX Fragrances will use WhatsApp communications for legitimate business purposes connected to the customer's interaction with MX Fragrances.`
            },
            {
                id: 'direct-marketing',
                title: 'Direct Marketing',
                content: `MX Fragrances will not treat an ordinary transaction as unlimited consent to receive unrelated marketing.

Where direct marketing by electronic communication requires consent under applicable law, the appropriate consent mechanism will be used.

Customers may request that their personal information not be used for direct marketing where applicable.`
            },
            {
                id: 'cookies',
                title: 'Cookies and Technical Information',
                content: `The website may use cookies, local storage, analytics or similar technologies for functions such as maintaining website functionality, remembering settings, understanding website usage and improving performance.

Where third-party technologies are used, the relevant provider may process technical information according to its own privacy terms.

Customers may be able to control certain cookies through their browser or device settings, although disabling some technologies may affect website functionality.`
            },
            {
                id: 'security',
                title: 'Security',
                content: `MX Fragrances takes reasonable technical and organisational measures designed to protect personal information against unauthorised access, loss, misuse, alteration, disclosure or destruction.

Security measures may include:

• restricted access;
• authentication controls;
• secure website connections where supported;
• access limitations;
• secure handling of business records;
• appropriate device and account security;
• monitoring and investigation of suspected unauthorised activity.

No electronic transmission or storage system can be guaranteed to be completely secure.

Where a security compromise involving personal information occurs and applicable law requires notification, MX Fragrances will take the required steps.`
            },
            {
                id: 'retention',
                title: 'Retention',
                content: `Personal information will not be retained indefinitely without purpose.

Information may be retained for as long as reasonably necessary for the purpose for which it was collected, to complete a transaction, resolve a dispute, maintain accounting or business records, comply with legal obligations, establish or defend legal claims, prevent fraud, or satisfy another lawful purpose.

When information is no longer required and there is no lawful reason to retain it, appropriate deletion, destruction or de-identification measures may be taken.`
            },
            {
                id: 'children',
                title: "Children's Information",
                content: `The website is not intentionally designed to collect personal information from children without appropriate lawful authority or consent.

If MX Fragrances becomes aware that personal information has been collected unlawfully from a child, appropriate steps will be considered in accordance with applicable law.`
            },
            {
                id: 'access-correction',
                title: 'Access and Correction',
                content: `Subject to applicable law, individuals may request access to personal information held about them and may request correction or updating of inaccurate or incomplete information.

A request may be subject to reasonable identity verification and any lawful limitations or exceptions.`
            },
            {
                id: 'objection',
                title: 'Objection to Processing',
                content: `Where POPIA or another applicable law provides a right to object to particular processing, an individual may exercise that right through the appropriate MX Fragrances communication channel.

The request will be considered in accordance with applicable law.`
            },
            {
                id: 'complaints',
                title: 'Complaints',
                content: `If you believe that your personal information has been handled unlawfully, you should first contact MX Fragrances so that the matter can be investigated.

You may also have the right to lodge a complaint with the Information Regulator of South Africa.

The Information Regulator is the statutory body responsible, among other functions, for monitoring and enforcing compliance with POPIA and PAIA.`
            },
            {
                id: 'changes',
                title: 'Changes to This Policy',
                content: `This Privacy Policy may be updated when our processing practices, services, technology or legal obligations change.

The updated version will be published on the website with a revised effective or update date.`
            },
            {
                id: 'contact',
                title: 'Contact',
                content: `For privacy-related requests, customers should use the official MX Fragrances communication channel published on the website.

Where a specific request requires identity verification or additional information, MX Fragrances may request the information reasonably necessary to process the request.`
            },
            {
                id: 'legal-framework',
                title: 'Legal Framework',
                content: `This Policy is intended to operate alongside applicable South African legislation, including POPIA and other laws regulating electronic transactions, consumer protection, record keeping and privacy.

Nothing in this Policy limits a right or protection that cannot lawfully be excluded.`
            }
        ]
    },
    shipping: {
        id: 'shipping',
        title: 'Shipping & Returns',
        shortTitle: 'Shipping',
        description: 'Dispatch, delivery, returns, exchanges and refunds',
        icon: Truck,
        effectiveDate: '29 September 2026',
        lastUpdated: '29 September 2026',
        sections: [
            {
                id: 'order-processing',
                title: 'Order Processing',
                content: `Orders are not automatically accepted when submitted through the website.

MX Fragrances first verifies the required payment and order information in accordance with the Payment & Order Policy.

Once an order has been accepted, it is prepared for dispatch.

The product listing may specify an estimated dispatch period. Where no specific period is stated, MX Fragrances will communicate the applicable expected dispatch timeframe.`
            },
            {
                id: 'dispatch',
                title: 'Dispatch',
                content: `Products are prepared for dispatch using packaging appropriate to the product and delivery method.

Where a product listing states a dispatch estimate such as "1–2 business days", that refers to the expected period before dispatch and not necessarily the total delivery period.

Business days exclude Saturdays, Sundays and South African public holidays unless otherwise stated.`
            },
            {
                id: 'delivery',
                title: 'Delivery',
                content: `Delivery is performed either by MX Fragrances or an appointed third-party delivery provider.

Once an order has been dispatched, the customer may receive tracking or delivery information where that service is available.

Delivery times are estimates and may be affected by courier capacity, address accessibility, weather, public holidays, peak periods, operational disruptions or other circumstances outside MX Fragrances' reasonable control.`
            },
            {
                id: 'delivery-info',
                title: 'Delivery Information',
                content: `Customers are responsible for providing accurate:

• full name;
• telephone number;
• delivery address;
• suburb;
• city/town;
• province;
• postal code; and
• any other information reasonably required for delivery.

If an incorrect or incomplete address causes a failed delivery, the customer may be responsible for additional delivery costs where those costs are reasonably incurred and permitted by law.

MX Fragrances will not intentionally treat a customer as having accepted an undelivered order merely because a courier attempted delivery.`
            },
            {
                id: 'inspection',
                title: 'Delivery Inspection',
                content: `Customers should inspect the parcel as soon as reasonably possible after receiving it.

Where the parcel appears visibly damaged, the customer should, where reasonably possible, photograph the packaging before opening it.

Where the contents are damaged, incorrect or incomplete, the customer should retain the packaging and contact MX Fragrances as soon as reasonably possible.

Prompt reporting assists with courier investigations, but failure to report an issue immediately does not automatically remove a statutory consumer right.`
            },
            {
                id: 'wrong-product',
                title: 'Wrong Product or Missing Product',
                content: `If MX Fragrances sends an incorrect product or an item is missing from an order, the customer should contact MX Fragrances with the order details and available evidence.

The matter will be investigated and the appropriate remedy will be provided in accordance with the circumstances and applicable law.

Customers should not dispose of disputed packaging or products until MX Fragrances has confirmed whether they are required for inspection or return.`
            },
            {
                id: 'change-of-mind',
                title: 'Change-of-Mind Returns',
                content: `A customer may have a statutory right to cancel an online electronic transaction in circumstances provided for by applicable law.

Where the statutory cooling-off right under section 44 of the Electronic Communications and Transactions Act applies, a consumer may cancel a qualifying electronic transaction within seven days after receipt of the goods without giving a reason or incurring a penalty other than the direct cost of returning the goods. Where payment was already made, the statutory refund requirements apply.

This statutory right is separate from MX Fragrances' voluntary return policy.`
            },
            {
                id: 'opened-used',
                title: 'Products That Have Been Opened or Used',
                content: `Because fragrances are personal-use products, opening, spraying, applying, altering or using a product may affect whether it can be resold.

MX Fragrances may therefore require a returned product to remain unused and in its original condition where the applicable statutory return right or other legal basis permits such a condition.

However, MX Fragrances will not rely on an "opened product" rule to defeat a statutory right that legally applies to the customer.

In particular, statutory remedies relating to defective, unsafe, materially misdescribed or otherwise non-compliant goods remain unaffected.`
            },
            {
                id: 'defective',
                title: 'Defective or Non-Compliant Goods',
                content: `A product that is defective or does not meet the applicable statutory requirements is treated differently from a simple change-of-mind return.

Under the Consumer Protection Act, consumers have statutory rights relating to goods that are reasonably suitable for their intended purpose, of good quality, in good working order and free from defects, subject to the Act's provisions and exceptions.

The CPA's implied warranty provisions may permit a consumer, within six months after delivery, to return qualifying goods where they fail to satisfy the applicable requirements, with the remedies provided by law.

Where a customer believes that a product is defective, the customer should contact MX Fragrances and provide:

• order number;
• product details;
• description of the problem;
• photographs or video where useful;
• relevant packaging;
• any other information reasonably required to investigate the claim.`
            },
            {
                id: 'fragrance-performance',
                title: 'Fragrance Performance',
                content: `Fragrance longevity, projection, sillage and perceived scent can vary between individuals because of skin chemistry, application method, environment, temperature and other factors.

A customer not liking the fragrance, finding it weaker or stronger than expected, or experiencing different performance from another person does not automatically establish a product defect.

This does not limit rights where there is evidence of an actual defect, contamination, material misdescription or other legally recognised problem.`
            },
            {
                id: 'damaged',
                title: 'Damaged Products',
                content: `If an item is damaged in transit, MX Fragrances may require photographs and other reasonable evidence to investigate the issue with the delivery provider.

Customers should retain the damaged product and packaging until the matter has been resolved or MX Fragrances confirms that it is no longer required.

Any remedy will be determined according to the nature of the damage and applicable law.`
            },
            {
                id: 'returns-process',
                title: 'Returns Process',
                content: `Before returning any product, customers should contact MX Fragrances through the official customer communication channel.

Do not send a return to an address obtained from an unofficial source.

MX Fragrances will provide the appropriate return instructions where a return is authorised or required.

Unauthorised returns may experience delays because they may not be identifiable or may be sent to an address that is not equipped to receive returns.`
            },
            {
                id: 'refunds',
                title: 'Refunds',
                content: `Where a refund is due, the refund will be processed using an appropriate payment method and within the period required by applicable law.

Where a refund is delayed because a returned product must first be inspected, the customer will be informed where reasonably necessary.

Where a statutory cancellation or refund right applies, the statutory refund period will prevail over any shorter or longer internal processing period.`
            },
            {
                id: 'return-shipping',
                title: 'Return Shipping',
                content: `Responsibility for return shipping depends on the reason for the return and the applicable legal right.

Where the customer voluntarily returns a product because of a change of mind and the applicable statutory rule permits the customer to bear the direct cost of returning the goods, that direct return cost may be payable by the customer.

Where applicable law requires MX Fragrances to bear the return cost because the goods are defective, incorrect or otherwise subject to a statutory remedy, MX Fragrances will comply with that requirement.`
            },
            {
                id: 'exchanges',
                title: 'Exchanges',
                content: `Exchanges are subject to stock availability.

Where an exchange is not available or is not the appropriate statutory remedy, a refund or other remedy may apply.

MX Fragrances will not substitute an exchange for a statutory remedy where the law gives the consumer a different remedy.`
            },
            {
                id: 'gifts',
                title: 'Products Purchased as Gifts',
                content: `The customer who placed the order remains responsible for providing accurate order and delivery information.

Where a gift recipient receives the product, any return or refund may require information from the original purchaser because payment and transaction records relate to the purchaser.

Nothing in this section limits a recipient's applicable statutory rights.`
            },
            {
                id: 'failed-delivery',
                title: 'Failed Delivery',
                content: `Where delivery fails because the customer supplied incorrect information, was unavailable after reasonable delivery attempts, or otherwise caused the failure, MX Fragrances may recover reasonable additional delivery costs where legally permitted.

Where delivery fails because of an issue attributable to MX Fragrances or its appointed delivery provider, the matter will be investigated and the appropriate remedy applied.`
            },
            {
                id: 'unavailable',
                title: 'Unavailable Products',
                content: `If MX Fragrances accepts an order and subsequently becomes unable to supply the ordered product, MX Fragrances will notify the customer and provide the applicable remedy.

Where the law requires a refund, the refund will be processed within the applicable statutory period.`
            },
            {
                id: 'statutory-rights',
                title: 'Statutory Rights',
                content: `This Policy does not replace or restrict rights under the Consumer Protection Act, Electronic Communications and Transactions Act or any other applicable South African law.

Where a statutory right applies, that right takes precedence over any conflicting internal policy.`
            },
            {
                id: 'policy-updates',
                title: 'Policy Updates',
                content: `MX Fragrances may update this Policy when its shipping arrangements, return procedures or applicable legal obligations change.

The version applicable to an existing transaction will not retrospectively remove rights that have already accrued.`
            }
        ]
    },
    payment: {
        id: 'payment',
        title: 'Payment & Order Policy',
        shortTitle: 'Payment',
        description: 'How MX Fragrances accepts orders, verifies payments and confirms purchases',
        icon: CreditCard,
        effectiveDate: '29 September 2026',
        lastUpdated: '29 September 2026',
        sections: [
            {
                id: 'ordering-process',
                title: 'How the Ordering Process Works',
                content: `The MX Fragrances ordering process generally operates as follows:

Step 1 — Select Products
The customer selects the desired products and quantities through the website.

Step 2 — Submit Order
The customer submits the order with the required customer and delivery information.

Step 3 — Payment Instructions
MX Fragrances provides the applicable payment information or instructions.

Step 4 — Make Payment
The customer makes payment using the instructed payment method.

Step 5 — Send Proof of Payment
The customer sends a valid Proof of Payment through the official MX Fragrances WhatsApp channel.

Step 6 — Verification
MX Fragrances checks the Proof of Payment against the relevant transaction information and, where necessary, confirms that the funds have actually been received.

Step 7 — Order Acceptance
Only after the payment has been satisfactorily verified will MX Fragrances confirm acceptance of the order.

Step 8 — Fulfilment
The accepted order is then prepared for dispatch in accordance with the Shipping & Returns Policy.`
            },
            {
                id: 'payment-method',
                title: 'Payment Method',
                content: `MX Fragrances currently accepts payment through the payment method communicated in the applicable order instructions, including electronic funds transfer where offered.

Payment must be made only to the official payment details communicated by MX Fragrances.

Customers should verify payment details before making payment.

MX Fragrances will not be responsible for payments made to unofficial accounts, impersonators, fraudulent third parties or payment details obtained from unauthorised sources, subject to applicable law and the circumstances of the transaction.`
            },
            {
                id: 'proof-of-payment',
                title: 'Proof of Payment',
                content: `A customer who has made payment must send Proof of Payment through the official MX Fragrances WhatsApp channel as instructed.

A Proof of Payment should contain sufficient information to allow the transaction to be identified, such as:

• payer name;
• amount;
• payment date;
• transaction or reference number;
• bank or payment confirmation information where applicable.

Customers should not send banking passwords, PINs, card security codes, online-banking credentials or other authentication secrets.`
            },
            {
                id: 'screenshot-not-payment',
                title: 'A Screenshot Is Not Payment Confirmation',
                content: `Sending a screenshot, bank notification, payment notification or other document does not automatically establish that funds have been received.

MX Fragrances may verify the payment against its banking records or other appropriate transaction information.

Where payment cannot be verified, the order may remain pending until the matter is resolved.`
            },
            {
                id: 'altered-fraudulent',
                title: 'Altered or Fraudulent Proof of Payment',
                content: `MX Fragrances treats fraudulent Proof of Payment seriously.

Where there is a reasonable basis to suspect that a Proof of Payment has been altered, fabricated, duplicated or otherwise manipulated, MX Fragrances may:

• place the order on hold;
• request additional information;
• decline to fulfil the order;
• investigate the transaction;
• preserve relevant transaction records; and
• report suspected unlawful activity to the appropriate authorities where appropriate.

A customer remains responsible for ensuring that the information submitted to MX Fragrances is accurate and genuine.`
            },
            {
                id: 'payment-reference',
                title: 'Payment Reference',
                content: `Customers should use the payment reference specified by MX Fragrances.

Where an order number is supplied, the customer should include the order number or the reference requested by MX Fragrances.

An incorrect reference may delay payment matching and order confirmation.`
            },
            {
                id: 'payment-amount',
                title: 'Payment Amount',
                content: `The amount paid should correspond with the amount communicated for the order.

Underpayments may prevent the order from being accepted until the outstanding amount is resolved.

Overpayments will be investigated and handled appropriately, including refund where applicable.

MX Fragrances will not intentionally retain an amount that it is legally required to refund.`
            },
            {
                id: 'order-accepted',
                title: 'When an Order Becomes Accepted',
                content: `An order is accepted only when MX Fragrances communicates confirmation through an official communication channel after completing the necessary payment verification.

The following do not, on their own, constitute order acceptance:

• adding an item to a cart;
• submitting an order form;
• receiving an automated website notification;
• receiving an order number;
• making a bank transfer;
• sending a Proof of Payment;
• receiving a WhatsApp acknowledgement that a Proof of Payment was received.

The customer should wait for explicit order confirmation.`
            },
            {
                id: 'stock-payment',
                title: 'Stock and Payment',
                content: `Because stock is limited, products may remain available to other customers until an order has been accepted.

Payment does not automatically guarantee stock if the payment cannot be verified or if the product has become unavailable before acceptance.

Where MX Fragrances receives payment for a product that it is unable to supply, the customer will be notified and the applicable remedy will be provided in accordance with the law.`
            },
            {
                id: 'verification-time',
                title: 'Payment Verification Time',
                content: `Payment verification is performed during MX Fragrances' operating and administrative periods.

Verification may be delayed by:

• weekends;
• public holidays;
• banking delays;
• incorrect payment references;
• incomplete Proof of Payment;
• banking-system outages;
• payment-processing delays;
• discrepancies between the order and payment information.

Customers should not assume that sending Proof of Payment means the order is immediately ready for dispatch.`
            },
            {
                id: 'duplicate',
                title: 'Duplicate Payments',
                content: `If a customer accidentally makes more than one payment for the same order, the customer should notify MX Fragrances as soon as possible and provide the relevant transaction information.

Duplicate payments will be investigated and handled according to the circumstances.`
            },
            {
                id: 'unverified',
                title: 'Unverified Payments',
                content: `Where MX Fragrances cannot verify a payment, the order may remain pending.

MX Fragrances may request:

• a clearer Proof of Payment;
• the transaction reference;
• the payer's name;
• the payment date;
• the amount paid;
• other reasonable information necessary to identify the transaction.

Customers should not provide banking login credentials or security codes.`
            },
            {
                id: 'reversals',
                title: 'Payment Reversals and Chargebacks',
                content: `If a payment is reversed, recalled, dishonoured or otherwise not received by MX Fragrances, the order may be placed on hold or cancelled, subject to applicable law.

If goods have already been supplied and a payment is subsequently reversed without lawful basis, MX Fragrances reserves its rights to recover the amount owing through lawful means.

This section does not prevent a customer from exercising a legitimate statutory right to cancel a transaction or obtain a refund.`
            },
            {
                id: 'refunds',
                title: 'Refunds',
                content: `Where a refund is due, MX Fragrances may require sufficient information to identify the original transaction and verify the recipient of the refund.

Refunds will be processed according to the applicable refund policy and statutory requirements.

MX Fragrances will not use payment verification requirements to unlawfully delay or prevent a refund that is legally due.`
            },
            {
                id: 'cancellation-before',
                title: 'Order Cancellation Before Acceptance',
                content: `Before an order has been accepted, the customer may contact MX Fragrances to request cancellation.

Where payment has already been received, the request will be assessed together with the applicable statutory rights and the status of the transaction.

Cancellation of an order is not guaranteed merely because the customer has requested it; the applicable legal and transaction circumstances will determine the outcome.`
            },
            {
                id: 'accepted-error',
                title: 'Orders Accepted in Error',
                content: `If an order was accepted due to a genuine administrative, technical or pricing error, MX Fragrances may contact the customer to resolve the issue.

Where MX Fragrances cannot fulfil an accepted order, any refund or other remedy required by law will be provided.

Nothing in this section authorises MX Fragrances to disregard mandatory consumer protections.`
            },
            {
                id: 'fraud-prevention',
                title: 'Fraud Prevention',
                content: `MX Fragrances may conduct reasonable checks to protect customers and the business against fraud.

These checks may include verifying:

• payment information;
• order details;
• transaction references;
• customer information;
• unusual order activity;
• repeated or suspicious payment attempts.

Where additional verification is reasonably required, fulfilment may be delayed until the issue has been resolved.`
            },
            {
                id: 'official-channels',
                title: 'Official Communication Channels',
                content: `Customers should communicate payment and order information only through official MX Fragrances channels published on the website.

MX Fragrances will not ask customers to provide passwords, PINs, one-time passwords, online-banking credentials or card security codes.

If a customer receives payment instructions that appear different from the official instructions, payment should not be made until the information has been independently verified through an official MX Fragrances channel.`
            },
            {
                id: 'customer-responsibility',
                title: 'Customer Responsibility',
                content: `Customers are responsible for:

• checking the order before submission;
• ensuring the correct products and quantities are selected;
• providing accurate contact and delivery information;
• making payment to the correct official account;
• using the correct payment reference;
• sending genuine Proof of Payment;
• responding to reasonable verification requests;
• keeping their own banking and authentication credentials secure.`
            },
            {
                id: 'mx-responsibility',
                title: 'MX Fragrances Responsibility',
                content: `MX Fragrances is responsible for processing accepted orders in accordance with the information supplied to the customer, applicable policies and applicable law.

MX Fragrances will take reasonable measures to verify payments and prevent fraudulent transactions.`
            },
            {
                id: 'electronic-transactions',
                title: 'Electronic Transactions',
                content: `Where the transaction constitutes an electronic transaction, applicable provisions of the Electronic Communications and Transactions Act may apply.

The ECTA contains requirements concerning electronic transactions, including information that suppliers must provide, an opportunity for consumers to review and correct transactions before final submission, payment-security requirements and, where applicable, cooling-off rights.

Nothing in this Policy is intended to contract out of those statutory requirements.`
            },
            {
                id: 'policy-updates',
                title: 'Policy Updates',
                content: `MX Fragrances may update this Policy when its payment methods, ordering process, technology or legal obligations change.

The version applicable to a transaction will not retrospectively remove rights that have already accrued.`
            },
            {
                id: 'questions-disputes',
                title: 'Questions and Disputes',
                content: `Questions concerning payment or order status should be directed to the official MX Fragrances customer communication channel.

Where a payment or order dispute arises, MX Fragrances will review the relevant order, payment and communication records and communicate the outcome to the customer.

Nothing in this process prevents a consumer from exercising any statutory right or seeking assistance from a competent dispute-resolution or regulatory body.`
            },
            {
                id: 'statutory-rights',
                title: 'Statutory Rights',
                content: `This Policy does not replace applicable consumer-protection legislation.

Where a statutory consumer right applies, that right will prevail over any conflicting internal procedure or policy.`
            }
        ]
    }
};

// ============================================
// PRINT STYLES  // ── PRINT FIX ──
// ============================================

const PRINT_STYLES = `
  @media print {
    @page {
      margin: 18mm 16mm;
      size: A4;
    }

    html, body {
      background: #ffffff !important;
      color: #000000 !important;
    }

    /* Hide everything that isn't the printable document */
    nav,
    footer,
    aside,
    .no-print,
    .print-hide,
    [class*="lg:hidden"] {
      display: none !important;
    }

    /* Neutralise the motion wrapper & container backgrounds */
    .print-wrapper,
    .print-wrapper * {
      background: transparent !important;
      color: #000000 !important;
      box-shadow: none !important;
      border-color: #dddddd !important;
      transform: none !important;
      opacity: 1 !important;
      animation: none !important;
      transition: none !important;
    }

    .container {
      max-width: 100% !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    /* Collapse the two-column layout */
    .lg\\:grid {
      display: block !important;
    }

    /* Print header */
    .print-header {
      border-bottom: 2px solid #000 !important;
      padding-bottom: 10pt !important;
      margin-bottom: 18pt !important;
      page-break-after: avoid;
    }

    .print-header h1 {
      font-size: 22pt !important;
      color: #000 !important;
      font-family: 'Playfair Display', Georgia, serif !important;
      margin: 0 0 4pt 0 !important;
      letter-spacing: -0.01em !important;
      line-height: 1.2 !important;
    }

    .print-header p {
      font-size: 10pt !important;
      color: #333 !important;
      margin: 0 !important;
    }

    .print-header .print-meta {
      font-size: 8pt !important;
      color: #666 !important;
      margin-top: 6pt !important;
      letter-spacing: 0.05em !important;
      text-transform: uppercase !important;
    }

    /* Document frame */
    .print-doc {
      border: none !important;
      background: #fff !important;
    }

    /* Sections */
    .print-section {
      border-bottom: 1px solid #e5e5e5 !important;
      padding: 9pt 0 !important;
      page-break-inside: avoid;
    }

    .print-section:last-child {
      border-bottom: none !important;
    }

    .print-section h3 {
      font-size: 12pt !important;
      color: #000 !important;
      font-weight: 600 !important;
      margin: 0 0 6pt 0 !important;
      font-family: 'Inter', Arial, sans-serif !important;
      letter-spacing: 0 !important;
    }

    .print-section .print-number {
      color: #999 !important;
      font-size: 9pt !important;
      margin-right: 8pt !important;
      font-family: 'Inter', Arial, sans-serif !important;
    }

    .print-section .print-body {
      font-size: 10pt !important;
      line-height: 1.55 !important;
      color: #000 !important;
      font-family: 'Inter', Arial, sans-serif !important;
      white-space: pre-line !important;
      border-left: none !important;
      padding-left: 0 !important;
      margin-left: 0 !important;
    }

    /* Always show the print-only heading + body */
    .print-only {
      display: block !important;
    }

    /* Kill any remaining dark utility classes */
    [class*="border-white"],
    [class*="bg-white"],
    [class*="bg-zinc"],
    [class*="bg-black"] {
      background: transparent !important;
      border-color: #e5e5e5 !important;
    }

    h1, h2, h3, h4, h5, h6 {
      color: #000 !important;
    }

    h1, h2, h3 {
      page-break-after: avoid;
    }

    /* Print footer note */
    .print-footer {
      margin-top: 20pt !important;
      padding-top: 10pt !important;
      border-top: 1px solid #ccc !important;
      font-size: 8.5pt !important;
      color: #444 !important;
      line-height: 1.5 !important;
    }

    /* Hide decorative icons in print */
    .print-hide-icon {
      display: none !important;
    }
  }
`;

// ============================================
// SECTION COMPONENT
// ============================================

const LegalSection = ({section, index, isExpanded, onToggle}) => (
    <div className="print-section group">
        {/* Screen-only interactive heading */}
        <button
            onClick={onToggle}
            className="no-print w-full py-4 flex items-start justify-between gap-6 text-left"
        >
            <div className="flex items-start gap-4 min-w-0">
                <span className={`print-number text-[10px] font-mono tracking-wider mt-1 transition-colors ${
                    isExpanded ? 'text-[#D4AF37]' : 'text-white/20 group-hover:text-white/40'
                }`}>
                    {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className={`text-[15px] font-light tracking-wide transition-colors ${
                    isExpanded ? 'text-[#D4AF37]' : 'text-white/90 group-hover:text-white'
                }`}>
                    {section.title}
                </h3>
            </div>
            <ChevronDown
                size={16}
                className={`print-hide-icon text-white/30 transition-all duration-300 flex-shrink-0 mt-1 ${
                    isExpanded ? 'rotate-180 text-[#D4AF37]' : 'group-hover:text-white/50'
                }`}
            />
        </button>

        {/* Screen-only animated body */}
        <AnimatePresence initial={false}>
            {isExpanded && (
                <motion.div
                    initial={{height: 0, opacity: 0}}
                    animate={{height: 'auto', opacity: 1}}
                    exit={{height: 0, opacity: 0}}
                    transition={{duration: 0.25, ease: 'easeInOut'}}
                    className="no-print overflow-hidden"
                >
                    <div className="pl-[38px] pb-6 pr-4">
                        <div
                            className="text-white/55 text-[13px] leading-[1.8] font-light whitespace-pre-line border-l border-white/5 pl-5">
                            {section.content}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Print-only: always fully rendered, black on white */}
        <div className="print-only hidden">
            <div style={{display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4pt'}}>
                <span className="print-number">{String(index + 1).padStart(2, '0')}</span>
                <h3>{section.title}</h3>
            </div>
            <div className="print-body">{section.content}</div>
        </div>
    </div>
);

// ============================================
// DOCUMENT CARD COMPONENT
// ============================================

const DocumentCard = ({doc, isActive, onClick}) => {
    const Icon = doc.icon;
    return (
        <button
            onClick={onClick}
            className={`no-print w-full text-left px-4 py-3.5 rounded-sm transition-all duration-200 flex items-center gap-3.5 ${
                isActive
                    ? 'bg-[#D4AF37]/[0.08] border-l-2 border-[#D4AF37]'
                    : 'border-l-2 border-transparent hover:bg-white/[0.03] hover:border-white/10'
            }`}
        >
            <Icon
                size={16}
                className={`flex-shrink-0 transition-colors ${
                    isActive ? 'text-[#D4AF37]' : 'text-white/30'
                }`}
            />
            <div className="min-w-0 flex-1">
                <p className={`text-[13px] transition-colors truncate ${
                    isActive ? 'text-[#D4AF37]' : 'text-white/70'
                }`}>
                    {doc.title}
                </p>
            </div>
            {isActive && (
                <ChevronRight size={14} className="text-[#D4AF37]/60 flex-shrink-0"/>
            )}
        </button>
    );
};

// ============================================
// MAIN LEGAL COMPONENT
// ============================================

const Legal = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const pathParts = location.pathname.split('/').filter(Boolean);
    const slug = pathParts[pathParts.length - 1];

    const defaultDoc = useMemo(() => {
        if (slug && LEGAL_DOCUMENTS[slug]) return slug;
        return 'terms';
    }, [slug]);

    const [activeDocId, setActiveDocId] = useState(defaultDoc);
    const [expandedSections, setExpandedSections] = useState(new Set());
    const [isMobileDocMenuOpen, setIsMobileDocMenuOpen] = useState(false);

    useEffect(() => {
        setActiveDocId(defaultDoc);
    }, [defaultDoc]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [activeDocId]);

    useEffect(() => {
        setIsMobileDocMenuOpen(false);
    }, [activeDocId]);

    const activeDoc = LEGAL_DOCUMENTS[activeDocId];
    const ActiveIcon = activeDoc.icon;

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(sectionId)) {
                next.delete(sectionId);
            } else {
                next.add(sectionId);
            }
            return next;
        });
    };

    const expandAll = () => {
        setExpandedSections(new Set(activeDoc.sections.map(s => s.id)));
    };

    const collapseAll = () => {
        setExpandedSections(new Set());
    };

    // ── PRINT FIX: expand everything, wait a tick, then print ──
    const handlePrint = () => {
        setExpandedSections(new Set(activeDoc.sections.map(s => s.id)));
        setTimeout(() => {
            window.print();
        }, 120);
    };

    const handleDocChange = (docId) => {
        setActiveDocId(docId);
        setExpandedSections(new Set());
        navigate(`/legal/${docId}`, {replace: true});
    };

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            className="print-wrapper pt-32 md:pt-40 pb-24 min-h-screen text-left"
        >
            {/* ── PRINT FIX: inject print stylesheet ── */}
            <style>{PRINT_STYLES}</style>

            <div className="container mx-auto px-4 md:px-6 max-w-7xl">
                {/* Breadcrumb */}
                <div className="no-print flex items-center justify-between gap-4 mb-12">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-white/30 hover:text-white transition-colors text-[10px] tracking-widest font-medium group"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform"/>
                        Back
                    </Link>
                    <div className="hidden md:flex items-center gap-2 text-white/20 text-[10px] tracking-widest">
                        <span>Legal</span>
                        <span className="text-white/10">/</span>
                        <span className="text-[#D4AF37]">{activeDoc.shortTitle}</span>
                    </div>
                </div>

                {/* Header */}
                <div className="print-header mb-14">
                    <div className="flex items-start gap-5 mb-6">
                        <div
                            className="print-hide-icon w-12 h-12 rounded-sm bg-[#D4AF37]/[0.08] border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                            <ActiveIcon size={20} className="text-[#D4AF37]"/>
                        </div>
                        <div>
                            <p className="text-[#D4AF37]/70 text-[9px] uppercase tracking-[0.4em] font-semibold mb-2">
                                Legal Documentation
                            </p>
                            <h1 className="text-3xl md:text-4xl text-white font-serif tracking-tight leading-tight">
                                {activeDoc.title}
                            </h1>
                        </div>
                    </div>
                    <p className="text-white/40 text-[13px] max-w-xl font-light leading-relaxed ml-[68px] print:ml-0">
                        {activeDoc.description}
                    </p>

                    {/* Metadata */}
                    <div
                        className="print-meta flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 ml-[68px] print:ml-0 text-[10px] tracking-widest text-white/25">
                        <span className="flex items-center gap-1.5">
                            <Calendar size={11} className="print-hide-icon text-[#D4AF37]/50"/>
                            Effective {activeDoc.effectiveDate}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock size={11} className="print-hide-icon text-[#D4AF37]/50"/>
                            Updated {activeDoc.lastUpdated}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <FileText size={11} className="print-hide-icon text-[#D4AF37]/50"/>
                            {activeDoc.sections.length} sections
                        </span>
                    </div>
                </div>

                {/* Mobile Document Selector */}
                <div className="no-print lg:hidden mb-8">
                    <button
                        onClick={() => setIsMobileDocMenuOpen(!isMobileDocMenuOpen)}
                        className="w-full flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-sm px-4 py-3.5 text-left"
                    >
                        <div className="flex items-center gap-3">
                            <ActiveIcon size={15} className="text-[#D4AF37]"/>
                            <span className="text-white text-[13px]">{activeDoc.title}</span>
                        </div>
                        <ChevronDown size={16}
                                     className={`text-white/30 transition-transform ${isMobileDocMenuOpen ? 'rotate-180' : ''}`}/>
                    </button>

                    <AnimatePresence>
                        {isMobileDocMenuOpen && (
                            <motion.div
                                initial={{height: 0, opacity: 0}}
                                animate={{height: 'auto', opacity: 1}}
                                exit={{height: 0, opacity: 0}}
                                className="overflow-hidden"
                            >
                                <div className="pt-2 space-y-1">
                                    {Object.values(LEGAL_DOCUMENTS).map(doc => (
                                        <DocumentCard
                                            key={doc.id}
                                            doc={doc}
                                            isActive={doc.id === activeDocId}
                                            onClick={() => handleDocChange(doc.id)}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Main Grid */}
                <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-14">
                    {/* Desktop Sidebar */}
                    <aside className="no-print hidden lg:block">
                        <div className="sticky top-32">
                            <p className="text-white/20 text-[9px] uppercase tracking-[0.35em] font-semibold mb-3 px-4">
                                Documents
                            </p>
                            <nav className="space-y-0.5">
                                {Object.values(LEGAL_DOCUMENTS).map(doc => (
                                    <DocumentCard
                                        key={doc.id}
                                        doc={doc}
                                        isActive={doc.id === activeDocId}
                                        onClick={() => handleDocChange(doc.id)}
                                    />
                                ))}
                            </nav>

                            {/* Actions */}
                            <div className="mt-10 pt-8 border-t border-white/[0.04]">
                                <p className="text-white/20 text-[9px] uppercase tracking-[0.35em] font-semibold mb-3 px-4">
                                    Actions
                                </p>
                                <div className="space-y-0.5">
                                    <button
                                        onClick={expandAll}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] tracking-widest text-white/35 hover:text-white/70 transition-colors rounded-sm hover:bg-white/[0.02]"
                                    >
                                        <BookOpen size={13} className="text-[#D4AF37]/40"/>
                                        Expand all
                                    </button>
                                    <button
                                        onClick={collapseAll}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] tracking-widest text-white/35 hover:text-white/70 transition-colors rounded-sm hover:bg-white/[0.02]"
                                    >
                                        <FileText size={13} className="text-[#D4AF37]/40"/>
                                        Collapse all
                                    </button>
                                    <button
                                        onClick={handlePrint}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] tracking-widest text-white/35 hover:text-white/70 transition-colors rounded-sm hover:bg-white/[0.02]"
                                    >
                                        <Printer size={13} className="text-[#D4AF37]/40"/>
                                        Print
                                    </button>
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="mt-8 p-4 bg-white/[0.02] border border-white/[0.05] rounded-sm">
                                <div className="flex items-center gap-2.5 mb-2.5">
                                    <AlertCircle size={14} className="text-[#D4AF37]/60"/>
                                    <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">
                                        Questions?
                                    </p>
                                </div>
                                <p className="text-white/30 text-[11px] leading-relaxed mb-3">
                                    For legal inquiries, contact us through official channels.
                                </p>
                                <Link
                                    to="/contact"
                                    className="inline-flex items-center gap-1.5 text-[#D4AF37]/70 text-[10px] tracking-widest font-semibold hover:text-[#D4AF37] transition-colors"
                                >
                                    Contact Support
                                    <ChevronRight size={11}/>
                                </Link>
                            </div>
                        </div>
                    </aside>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Mobile Actions */}
                        <div className="no-print lg:hidden flex items-center gap-2 mb-6">
                            <button
                                onClick={expandAll}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-[10px] tracking-widest text-white/40 bg-white/[0.03] border border-white/[0.06] rounded-sm hover:text-white/70 transition-colors"
                            >
                                <BookOpen size={12}/>
                                Expand
                            </button>
                            <button
                                onClick={collapseAll}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-[10px] tracking-widest text-white/40 bg-white/[0.03] border border-white/[0.06] rounded-sm hover:text-white/70 transition-colors"
                            >
                                <FileText size={12}/>
                                Collapse
                            </button>
                            <button
                                onClick={handlePrint}
                                className="flex items-center justify-center gap-2 px-3 py-2.5 text-[10px] tracking-widest text-white/40 bg-white/[0.03] border border-white/[0.06] rounded-sm hover:text-white/70 transition-colors"
                            >
                                <Printer size={12}/>
                            </button>
                        </div>

                        {/* Document */}
                        <div className="print-doc bg-white/[0.015] border border-white/[0.05] rounded-sm overflow-hidden">
                            {/* Doc header */}
                            <div
                                className="print-hide px-6 md:px-8 py-5 border-b border-white/[0.04] flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    <ActiveIcon size={15} className="print-hide-icon text-[#D4AF37]/60 flex-shrink-0"/>
                                    <p className="text-white/40 text-[11px] tracking-widest uppercase truncate">
                                        {activeDoc.title}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="hidden sm:inline text-white/15 text-[10px] tracking-widest">
                                        v. {activeDoc.lastUpdated}
                                    </span>
                                </div>
                            </div>

                            {/* Sections */}
                            <div className="px-6 md:px-8 divide-y divide-white/[0.03]">
                                {activeDoc.sections.map((section, index) => (
                                    <LegalSection
                                        key={section.id}
                                        section={section}
                                        index={index}
                                        isExpanded={expandedSections.has(section.id)}
                                        onToggle={() => toggleSection(section.id)}
                                    />
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="print-hide px-6 md:px-8 py-5 border-t border-white/[0.04] bg-black/10">
                                <div
                                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <CheckCircle2 size={13} className="text-[#D4AF37]/50"/>
                                        <p className="text-white/25 text-[10px] tracking-widest">
                                            End of document
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={handlePrint}
                                            className="flex items-center gap-1.5 text-white/25 hover:text-[#D4AF37] transition-colors text-[10px] tracking-widest"
                                        >
                                            <Printer size={11}/>
                                            Print
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (navigator.share) {
                                                    navigator.share({
                                                        title: activeDoc.title,
                                                        text: activeDoc.description,
                                                        url: window.location.href,
                                                    });
                                                }
                                            }}
                                            className="flex items-center gap-1.5 text-white/25 hover:text-[#D4AF37] transition-colors text-[10px] tracking-widest"
                                        >
                                            <Share2 size={11}/>
                                            Share
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Legal note */}
                        <div className="print-footer mt-6 px-5 py-4 bg-white/[0.015] border border-white/[0.04] rounded-sm">
                            <div className="flex items-start gap-3">
                                <Gavel size={14} className="print-hide-icon text-[#D4AF37]/40 flex-shrink-0 mt-0.5"/>
                                <p className="text-white/30 text-[11px] leading-[1.7]">
                                    Governed by the laws of the Republic of South Africa. Nothing in these policies
                                    excludes or limits a consumer right that cannot legally be excluded under South
                                    African law. Where a conflict exists between these policies and mandatory statutory
                                    consumer protection, the statutory protection will prevail.
                                </p>
                            </div>
                        </div>

                        {/* Other documents */}
                        <div className="no-print mt-8">
                            <p className="text-white/20 text-[9px] uppercase tracking-[0.35em] font-semibold mb-3">
                                Other Documents
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {Object.values(LEGAL_DOCUMENTS)
                                    .filter(d => d.id !== activeDocId)
                                    .map(doc => {
                                        const Icon = doc.icon;
                                        return (
                                            <button
                                                key={doc.id}
                                                onClick={() => handleDocChange(doc.id)}
                                                className="flex items-center gap-3 px-4 py-3 bg-white/[0.015] border border-white/[0.05] rounded-sm hover:border-[#D4AF37]/20 hover:bg-white/[0.03] transition-all text-left group"
                                            >
                                                <Icon size={14}
                                                      className="text-white/25 group-hover:text-[#D4AF37]/70 transition-colors flex-shrink-0"/>
                                                <div className="min-w-0">
                                                    <p className="text-white/60 text-[12px] truncate group-hover:text-white/80 transition-colors">
                                                        {doc.title}
                                                    </p>
                                                </div>
                                                <ChevronRight size={12}
                                                              className="text-white/15 group-hover:text-[#D4AF37]/50 ml-auto flex-shrink-0 transition-colors"/>
                                            </button>
                                        );
                                    })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Legal;