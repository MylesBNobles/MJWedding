'use client';

import { Container, SectionHeader, Card } from '@/components';
import { attireSections } from '@/lib/mockData';

export default function AttirePage() {
  return (
    <section className="pt-24 pb-16">
      <Container size="md">
        <SectionHeader
          title="Attire"
          subtitle="What to wear to our celebration"
        />

        <div className="space-y-12">
          {attireSections.map((section) => (
            <div key={section.id}>
              <h3 className="text-xl font-semibold text-fg mb-4">{section.title}</h3>
              <p className="text-muted mb-6">{section.description}</p>

              {/* Image tiles */}
              {section.images.length > 0 && (
                <div className="hidden sm:grid grid-cols-2 gap-4 mb-6">
                  {section.images.map((image, index) =>
                    image.startsWith('/') ? (
                      <img
                        key={index}
                        src={image}
                        alt={index === 0 ? 'Do' : 'Avoid'}
                        className="aspect-[4/3] rounded-lg object-cover"
                      />
                    ) : (
                      <div
                        key={index}
                        className="aspect-[4/3] rounded-lg"
                        style={{ background: image }}
                      />
                    )
                  )}
                </div>
              )}

              {/* Do / Avoid lists */}
              {(section.doList.length > 0 || section.avoidList.length > 0) && (
                <div className="hidden sm:grid sm:grid-cols-2 gap-6">
                  <Card>
                    <h4 className="font-semibold text-fg mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Do
                    </h4>
                    <ul className="space-y-2">
                      {section.doList.map((item, index) => (
                        <li key={index} className="text-sm text-muted flex gap-2">
                          <span className="text-green-500">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Card>

                  <Card>
                    <h4 className="font-semibold text-fg mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Avoid
                    </h4>
                    <ul className="space-y-2">
                      {section.avoidList.map((item, index) => (
                        <li key={index} className="text-sm text-muted flex gap-2">
                          <span className="text-red-500">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              )}

              {/* Mobile: pair image with list */}
              <div className="sm:hidden space-y-6">
                {section.images[0] && (
                  <div className="space-y-4">
                    {section.images[0].startsWith('/') ? (
                      <img
                        src={section.images[0]}
                        alt="Do"
                        className="aspect-[4/3] rounded-lg object-cover"
                      />
                    ) : (
                      <div
                        className="aspect-[4/3] rounded-lg"
                        style={{ background: section.images[0] }}
                      />
                    )}
                    {section.doList.length > 0 && (
                      <Card>
                        <h4 className="font-semibold text-fg mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Do
                        </h4>
                        <ul className="space-y-2">
                          {section.doList.map((item, index) => (
                            <li key={index} className="text-sm text-muted flex gap-2">
                              <span className="text-green-500">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}
                  </div>
                )}

                {section.images[1] && (
                  <div className="space-y-4">
                    {section.images[1].startsWith('/') ? (
                      <img
                        src={section.images[1]}
                        alt="Avoid"
                        className="aspect-[4/3] rounded-lg object-cover"
                      />
                    ) : (
                      <div
                        className="aspect-[4/3] rounded-lg"
                        style={{ background: section.images[1] }}
                      />
                    )}
                    {section.avoidList.length > 0 && (
                      <Card>
                        <h4 className="font-semibold text-fg mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Avoid
                        </h4>
                        <ul className="space-y-2">
                          {section.avoidList.map((item, index) => (
                            <li key={index} className="text-sm text-muted flex gap-2">
                              <span className="text-red-500">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
