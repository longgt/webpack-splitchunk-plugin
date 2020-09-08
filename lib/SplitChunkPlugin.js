/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author @longgt
*/
"use strict";

class SplitChunkPlugin {
	constructor(options) {
		if(options !== undefined && typeof options !== "object" || Array.isArray(options)) {
			throw new Error("Argument should be an options object. To use defaults, pass in nothing.\nFor more info on options, see https://webpack.js.org/plugins/");
		}
		this.options = options || {};
		if(typeof this.options.maxChunkSize !== "number") this.options.maxChunkSize = 100 * 1024;
		if(typeof this.options.maxSize !== "number") this.options.maxSize = 30 * 1024;
		if(typeof this.options.minModules !== "number") this.options.minModules = 10;
	}

	apply(compiler) {
		compiler.plugin("this-compilation", (compilation) => {
			compilation.plugin("optimize-chunks-advanced", (chunks) => {

				const moduleOccurrence = this.getTargetChunks(chunks);
				var newChunk;
				var affectedChunks = [];
				var size = -1;
				const maxSize = this.options.maxSize;
				const minModules = this.options.minModules;

				moduleOccurrence.forEach((obj) => {
					// Only split module occurrences at least minModules times
					if (obj.count >= minModules) {
						var canMove = true;
						const module = obj.module;
						// Skip all module belonging to runtime or entry chunk
						module.getChunks().forEach((chunk) => {
							if (chunk.hasRuntime() || chunk.hasEntryModule()) {
								canMove = false;
								return;
							}
						});
						if (canMove) {
							// Create new chunk
							if (size === -1) {
								newChunk = compilation.addChunk();
							}
							const usedChunks = module.getChunks();
							affectedChunks = affectedChunks.concat(usedChunks);
							// Move module to new chunk and dereference from old chunk
							usedChunks.forEach((chunk) => {
								chunk.moveModule(module, newChunk);
							});

							const newSize = newChunk.size({});

							if (newSize > maxSize) {
								this.makeTargetChunkParentOfAffectedChunks(affectedChunks, newChunk);
								size = -1;
								affectedChunks = [];
								newChunk = null;
							} else {
								size = newSize;
							}
						}
					}
				});
				if (affectedChunks.length > 0 && newChunk) {
					this.makeTargetChunkParentOfAffectedChunks(affectedChunks, newChunk);
				}
			});
		});
	}

	/**
	 * Get target chunks
	 * @param {Array} allChunks 
	 */
	getTargetChunks(allChunks) {
		// Find all chunks containing all modules in the split
		const moduleMap = new Map();
		for(let i = 0; i < allChunks.length; i++) {
			const chunk = allChunks[i];
			const chunkSize = chunk.size({});

			if (chunk.hasRuntime() || chunk.hasEntryModule() || chunkSize <= this.options.maxChunkSize) {
				//return;
			} else {
				chunk.forEachModule(function(module) {
					var cnt = moduleMap.get(module) || 0;
					moduleMap.set(module, cnt + 1);
				});
			}
		}

		var moduleOccurrence = [];
		moduleMap.forEach((value, key, map) => {
			if (key && !key.context.includes('node_modules')) {
				moduleOccurrence.push({
					module: key,
					count: value
				});
			}
		});
		moduleOccurrence.sort(function(m1, m2) {
			if (m1.count > m2.count) return -1;
			if (m1.count === m2.count) return 0;
			return 1;
		});

		return moduleOccurrence;
	}

	/**
	 * Link affected chunks and new common chunk
	 * @param {Chunk} affectedChunks The affected chunks
	 * @param {Chunk} commonChunk The new common chunk
	 */
	makeTargetChunkParentOfAffectedChunks(affectedChunks, commonChunk) {
		affectedChunks.forEach((chunk) => {
			chunk.split(commonChunk);
		});
	}
}

module.exports = SplitChunkPlugin;
