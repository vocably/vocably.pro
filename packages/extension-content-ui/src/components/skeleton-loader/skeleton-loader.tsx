import { Component, h } from '@stencil/core';

@Component({
  tag: 'vocably-skeleton-loader',
  styleUrl: 'skeleton-loader.scss',
  shadow: true,
})
export class VocablySkeletonLoader {
  render() {
    return (
      <div style={{ paddingLeft: '12px' }}>
        <vocably-skeleton-loader-bone class="title"></vocably-skeleton-loader-bone>
        <vocably-skeleton-loader-bone
          class="text"
          style={{ width: '70%' }}
        ></vocably-skeleton-loader-bone>
        <vocably-skeleton-loader-bone
          class="text"
          style={{ width: '71%' }}
        ></vocably-skeleton-loader-bone>
        <vocably-skeleton-loader-bone
          class="text"
          style={{ width: '69%' }}
        ></vocably-skeleton-loader-bone>
        <vocably-skeleton-loader-bone
          class="text"
          style={{ width: '20%' }}
        ></vocably-skeleton-loader-bone>
      </div>
    );
  }
}
