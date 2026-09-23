import fs from 'fs';
import path from 'path';

const DESKTOP_DIR = 'C:\\Users\\HP\\Desktop';

const rawContacts = [
  { name: 'Vikram Goyal', email: 'vikram.850@gmail.com', phone: '7988442561' },
  { name: 'Gayathri A', email: 'gayathrisf21@gmail.com', phone: '7337275533' },
  { name: 'Ameera Habibullah', email: 'ameerahabib24@gmail.com', phone: '966511508257' },
  { name: 'Dilsha Rameshi Wijesinghe', email: 'rameshi.wijesinghe@gmail.com', phone: '758043025' },
  { name: 'Maria Ana Sanchez', email: 'maria-ana-sanchez@hotmail.com', phone: '4380943073' },
  { name: 'Shadiya M', email: 'shadiyalatheef.k@gmail.com', phone: '568158312' },
  { name: 'Osha Sallal Kahoor', email: 'sallalosha@gmail.com', phone: '547186918' },
  { name: 'Ankit Sehrawat', email: 'ankitsehrawat09@gmail.com', phone: '8059067250' },
  { name: 'Subitha Sivakumar', email: 'subithaconnect@gmail.com', phone: '75411842' },
  { name: 'Manisha', email: 'manisha.Rsharma1356@gmail.com', phone: '9675347470' },
  { name: 'Rama Bala', email: 'ramabala7070@gmail.com', phone: '8198075205' },
  { name: 'Joya Lal', email: 'educoach2025@gmail.com', phone: '9650157029' },
  { name: 'Kallappa Bajantri', email: 'kallappabajantri7890@gmail.com', phone: '8660879870' },
  { name: 'SHREEPADAGOUDA PATIL', email: 'shreepad591@gmail.com', phone: '9738859591' },
  { name: 'UMMUL HAIRA K A', email: 'hairahussain08@gmail.com', phone: '9746075301' },
  { name: 'Manjunath y sandaraki', email: 'manumanu67776@gmail.com', phone: '7676430260' },
  { name: 'Manesh N M', email: 'mnmmathsworld6@gmail.com', phone: '7204832538' },
  { name: 'Heena', email: 'heena527@gmail.com', phone: '8431894987' },
  { name: 'Shilpi Mahendru', email: 'shilpimahendru@gmail.com', phone: '9822200786' },
  { name: 'Dola Bhattacharya', email: 'rpdola2402@gmail.com', phone: '9007436259' },
  { name: 'Suman Keshav', email: 'suman.keshav@ramjasrkp.com', phone: '9149337613' },
  { name: 'Mathews K Thomas', email: 'nathewdonbosco@gmail.com', phone: '9818946850' },
  { name: 'Parvati Gopal shinde', email: 'parvatigopalshinde65@gmail.com', phone: '9945213684' },
  { name: 'Ashu Khattar', email: 'ashu.khattar@learn.apeejay.edu', phone: '7303544875' },
  { name: 'Mrs. Poonam Kawatra', email: 'vice_principal@blmacademy.com', phone: '7017166853' },
  { name: 'Esther Sofia s', email: 'sofiasampraveen@gmail.com', phone: '9597485073' },
  { name: 'Rukmini Rai', email: 'rukminirai@hotmail.com', phone: '9811838290' }
];

function generateVcard(name, phone, email) {
  const cleanName = name.trim();
  const rawDigits = phone.replace(/\D/g, '');
  let formattedPhone = '';
  
  if (rawDigits.length === 10) {
    formattedPhone = `+91${rawDigits}`;
  } else if (rawDigits.length > 0) {
    formattedPhone = `+${rawDigits}`;
  }

  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:;209. ${cleanName};;;`,
    `FN:209. ${cleanName}`
  ];

  if (formattedPhone) {
    vcard.push(`TEL;TYPE=CELL:${formattedPhone}`);
  }
  if (email) {
    vcard.push(`EMAIL;TYPE=INTERNET:${email.trim()}`);
  }
  vcard.push('END:VCARD');
  return vcard.join('\n');
}

function run() {
  console.log("=== GENERATING VCF WITH PREFIX '209.' ===");
  console.log(`Total Contacts Received: ${rawContacts.length}`);

  const vcards = rawContacts.map(c => generateVcard(c.name, c.phone, c.email));
  const vcfContent = vcards.join('\n\n') + '\n';

  const localFile = '209_Contacts.vcf';
  const desktopFile1 = path.join(DESKTOP_DIR, '209_Contacts.vcf');
  const desktopFile2 = path.join(DESKTOP_DIR, '209_AI_Passport_Contacts.vcf');

  fs.writeFileSync(localFile, vcfContent, 'utf8');
  fs.writeFileSync(desktopFile1, vcfContent, 'utf8');
  fs.writeFileSync(desktopFile2, vcfContent, 'utf8');

  console.log(`✅ Saved VCF locally: ${localFile}`);
  console.log(`✅ Saved VCF on Desktop: ${desktopFile1}`);
  console.log(`✅ Saved VCF on Desktop: ${desktopFile2}`);
}

run();
