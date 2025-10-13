import fs from 'fs';
import path from 'path';
import forge from 'node-forge';
import { SignedXml } from 'xml-crypto';
import { DOMParser } from '@xmldom/xmldom';

function certToBase64(certPem: string) {
  return certPem.replace('-----BEGIN CERTIFICATE-----', '').replace('-----END CERTIFICATE-----', '').replace(/\r?\n|\r/g, '');
}

export function loadA1FromPfx(pfxPath: string, password: string) {
  const abs = path.isAbsolute(pfxPath) ? pfxPath : path.join(process.cwd(), pfxPath);
  const buf = fs.readFileSync(abs);
  const p12Asn1 = forge.asn1.fromDer(buf.toString('binary'));
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

  const bags = p12.getBags({ bagType: forge.pki.oids.certBag });
  const certBag = bags[forge.pki.oids.certBag][0];
  const cert = certBag?.cert as forge.pki.Certificate;

  const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
  const keyObj = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0];
  const privateKey = keyObj?.key as forge.pki.PrivateKey;

  if (!cert || !privateKey) throw new Error('Certificado ou chave privada não encontrados no PFX');
  const certPem = forge.pki.certificateToPem(cert);
  const keyPem = forge.pki.privateKeyToPem(privateKey);
  return { certPem, keyPem };
}

export function signXmlEnveloped(xml: string, rootLocalName: 'NFe' | 'CTe', privateKeyPem: string, certPem: string) {
  const doc = new DOMParser().parseFromString(xml);
  const signer = new SignedXml();
  signer.addReference(
    `//*[local-name()='${rootLocalName}']`,
    ['http://www.w3.org/2000/09/xmldsig#enveloped-signature'],
    'http://www.w3.org/2001/04/xmlenc#sha256'
  );
  signer.signingKey = privateKeyPem;
  const keyInfoProvider: { getKeyInfo: () => string } = {
    getKeyInfo: () => `<X509Data><X509Certificate>${certToBase64(certPem)}</X509Certificate></X509Data>`,
  };
  signer.keyInfoProvider = keyInfoProvider;
  signer.computeSignature(xml, {
    location: { reference: `//*[local-name()='${rootLocalName}']`, action: 'append' },
  });
  return signer.getSignedXml();
}