import React, { useEffect } from 'react';
import { Beat } from '../../types';

interface TypeBeatSchemaProps {
  beat?: Beat | null;
  beats?: Beat[];
  storeName?: string;
  producerName?: string;
}

export const TypeBeatSchema: React.FC<TypeBeatSchemaProps> = ({
  beat,
  beats = [],
  storeName = 'KRAEZELV Store',
  producerName = 'KRAEZELV'
}) => {
  useEffect(() => {
    // Remove existing injected schema script if present
    const existingScript = document.getElementById('kraezelv-jsonld-schema');
    if (existingScript) {
      existingScript.remove();
    }

    let schemaData: any = null;

    if (beat) {
      // Individual Beat MusicRecording + Product Schema
      const typeBeatKeyword = `${beat.genre || 'Hip Hop'} Type Beat - ${beat.title}`;
      
      schemaData = {
        '@context': 'https://schema.org',
        '@type': ['MusicRecording', 'Product'],
        'name': `${beat.title} (${typeBeatKeyword})`,
        'description': beat.description || `Official ${beat.genre} instrumental produced by ${producerName}. ${beat.bpm} BPM, Key: ${beat.key}. High-headroom 24-bit WAV / MP3 licensing available.`,
        'byArtist': {
          '@type': 'MusicGroup',
          'name': producerName
        },
        'inAlbum': {
          '@type': 'MusicAlbum',
          'name': 'KRAEZELV Master Catalog'
        },
        'duration': 'PT3M15S',
        'genre': beat.genre,
        'image': beat.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
        'audio': {
          '@type': 'AudioObject',
          'contentUrl': beat.audioUrl,
          'encodingFormat': 'audio/mpeg'
        },
        'offers': {
          '@type': 'AggregateOffer',
          'priceCurrency': 'USD',
          'lowPrice': beat.licenses?.basic?.price || 29.99,
          'highPrice': beat.licenses?.exclusive?.price || 499.99,
          'offerCount': 4,
          'offers': [
            {
              '@type': 'Offer',
              'name': 'MP3 Lease License',
              'price': beat.licenses?.basic?.price || 29.99,
              'priceCurrency': 'USD',
              'availability': 'https://schema.org/InStock'
            },
            {
              '@type': 'Offer',
              'name': 'WAV Lease License',
              'price': beat.licenses?.premium?.price || 49.99,
              'priceCurrency': 'USD',
              'availability': 'https://schema.org/InStock'
            },
            {
              '@type': 'Offer',
              'name': 'Unlimited Stems License',
              'price': beat.licenses?.unlimited?.price || 149.99,
              'priceCurrency': 'USD',
              'availability': 'https://schema.org/InStock'
            },
            {
              '@type': 'Offer',
              'name': 'Exclusive Rights License',
              'price': beat.licenses?.exclusive?.price || 499.99,
              'priceCurrency': 'USD',
              'availability': 'https://schema.org/InStock'
            }
          ]
        }
      };
    } else {
      // Storefront WebSite + MusicStore Catalog Schema
      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'MusicGroup',
        'name': producerName,
        'url': window.location.origin,
        'description': 'Premium Standalone Producer Platform for high-end beat leasing, sound kits, and professional music production services.',
        'genre': ['Dark Trap', 'UK Drill', 'Hyperpop', 'R&B'],
        'hasOfferCatalog': {
          '@type': 'OfferCatalog',
          'name': 'KRAEZELV Instrumental Beat Catalog',
          'itemListElement': beats.slice(0, 10).map((b, idx) => ({
            '@type': 'OfferCatalogItem',
            'position': idx + 1,
            'item': {
              '@type': 'MusicRecording',
              'name': b.title,
              'genre': b.genre,
              'byArtist': { '@type': 'MusicGroup', 'name': producerName }
            }
          }))
        }
      };
    }

    const script = document.createElement('script');
    script.id = 'kraezelv-jsonld-schema';
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById('kraezelv-jsonld-schema');
      if (el) el.remove();
    };
  }, [beat, beats, storeName, producerName]);

  return null;
};
